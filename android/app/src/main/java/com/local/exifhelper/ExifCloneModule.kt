package com.local.exifhelper

import android.app.Activity
import android.content.ContentValues
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import android.provider.MediaStore
import android.provider.OpenableColumns
import androidx.core.content.FileProvider
import androidx.exifinterface.media.ExifInterface
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ExifCloneModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
  private var pendingPickPromise: Promise? = null
  private var pendingShouldPersistPermission = false

  private val activityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
      if (requestCode != PICK_IMAGES_REQUEST_CODE) {
        return
      }

      val promise = pendingPickPromise ?: return
      pendingPickPromise = null

      try {
        if (resultCode != Activity.RESULT_OK || data == null) {
          promise.resolve(Arguments.createArray())
          return
        }

        val uris = collectPickedUris(data)
        val results = Arguments.createArray()
        uris.forEach { uri ->
          if (pendingShouldPersistPermission) {
            persistReadPermission(data, uri)
          }
          results.pushMap(photoInfo(uri))
        }
        promise.resolve(results)
      } catch (error: Exception) {
        promise.reject("PICK_IMAGES_FAILED", error.message ?: "选择照片失败", error)
      } finally {
        pendingShouldPersistPermission = false
      }
    }
  }

  init {
    reactContext.addActivityEventListener(activityEventListener)
  }

  override fun getName(): String = "ExifCloneModule"

  @ReactMethod
  fun pickImages(allowMultiple: Boolean, mode: String, promise: Promise) {
    val activity = currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "当前没有可用的 Android Activity")
      return
    }
    if (pendingPickPromise != null) {
      promise.reject("PICK_IN_PROGRESS", "已有照片选择操作正在进行")
      return
    }

    try {
      pendingPickPromise = promise
      pendingShouldPersistPermission = mode == PICK_MODE_FILES
      val intent = when (mode) {
        PICK_MODE_GALLERY -> galleryPickIntent(allowMultiple)
        PICK_MODE_FILES -> documentPickIntent(allowMultiple)
        else -> {
          pendingPickPromise = null
          pendingShouldPersistPermission = false
          promise.reject("INVALID_PICK_MODE", "未知照片选择方式")
          return
        }
      }
      activity.startActivityForResult(intent, PICK_IMAGES_REQUEST_CODE)
    } catch (error: Exception) {
      pendingPickPromise = null
      pendingShouldPersistPermission = false
      promise.reject("PICK_IMAGES_FAILED", error.message ?: "选择照片失败", error)
    }
  }

  private fun galleryPickIntent(allowMultiple: Boolean): Intent {
    if (!allowMultiple) {
      return Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI).apply {
        type = "image/*"
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      return Intent(MediaStore.ACTION_PICK_IMAGES).apply {
        type = "image/*"
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        if (allowMultiple) {
          putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
          putExtra(MediaStore.EXTRA_PICK_IMAGES_MAX, MediaStore.getPickImagesMaxLimit())
        }
      }
    }

    return Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI).apply {
      type = "image/*"
      putExtra(Intent.EXTRA_ALLOW_MULTIPLE, allowMultiple)
      addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
  }

  private fun documentPickIntent(allowMultiple: Boolean): Intent {
    return Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
      addCategory(Intent.CATEGORY_OPENABLE)
      type = "image/*"
      putExtra(Intent.EXTRA_ALLOW_MULTIPLE, allowMultiple)
      addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
    }
  }

  @ReactMethod
  fun readMetadata(uriString: String, promise: Promise) {
    try {
      val sourceFile = copyUriToCache(uriString, "source")
      val exif = ExifInterface(sourceFile.absolutePath)
      val result = Arguments.createMap()
      CLONE_TAGS.forEach { tag ->
        exif.getAttribute(tag)?.let { value ->
          result.putString(tag, value)
        }
      }
      promise.resolve(result)
    } catch (error: Exception) {
      promise.reject("EXIF_READ_FAILED", error.message ?: "无法读取照片元数据", error)
    }
  }

  @ReactMethod
  fun applyClone(request: ReadableMap, promise: Promise) {
    try {
      val sourceUri = request.getString("sourceUri")
        ?: throw IllegalArgumentException("sourceUri is required")
      val targetUris = request.getArray("targetUris")
        ?: throw IllegalArgumentException("targetUris is required")
      val requestedTags = request.getArray("tags")
        ?: throw IllegalArgumentException("tags is required")
      val pngOutputMode = if (request.hasKey("pngOutputMode")) {
        request.getString("pngOutputMode") ?: PNG_OUTPUT_MODE_PNG
      } else {
        PNG_OUTPUT_MODE_PNG
      }
      if (pngOutputMode != PNG_OUTPUT_MODE_PNG && pngOutputMode != PNG_OUTPUT_MODE_JPEG) {
        throw IllegalArgumentException("Unsupported pngOutputMode")
      }

      val tags = requestedTags.toStringList().filter { CLONE_TAGS.contains(it) }
      if (tags.isEmpty()) {
        throw IllegalArgumentException("No supported EXIF tags selected")
      }

      val sourceFile = copyUriToCache(sourceUri, "source")
      val sourceExif = ExifInterface(sourceFile.absolutePath)
      val sourceAttributes = tags.mapNotNull { tag ->
        sourceExif.getAttribute(tag)?.let { value -> tag to value }
      }
      if (sourceAttributes.isEmpty()) {
        throw IllegalArgumentException("Selected EXIF tags have no source values")
      }

      val results = Arguments.createArray()
      for (index in 0 until targetUris.size()) {
        val targetUri = targetUris.getString(index)
        if (targetUri == null) {
          results.pushMap(failure("", "目标 URI 为空", null))
          continue
        }
        results.pushMap(processTarget(targetUri, index, sourceAttributes, pngOutputMode))
      }

      promise.resolve(results)
    } catch (error: Exception) {
      promise.reject("EXIF_CLONE_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun getAppInfo(promise: Promise) {
    try {
      val packageInfo = currentPackageInfo()
      promise.resolve(Arguments.createMap().apply {
        putString("packageName", packageInfo.packageName)
        putString("versionName", packageInfo.versionName ?: "")
        putDouble("versionCode", packageVersionCode(packageInfo).toDouble())
      })
    } catch (error: Exception) {
      promise.reject("APP_INFO_FAILED", error.message ?: "无法读取应用版本信息", error)
    }
  }

  @ReactMethod
  fun getDownloadedUpdate(promise: Promise) {
    try {
      val update = validDownloadedUpdateOrNull()
      promise.resolve(update?.toWritableMap())
    } catch (error: Exception) {
      promise.reject("LOCAL_UPDATE_FAILED", error.message ?: "无法读取本地更新包", error)
    }
  }

  @ReactMethod
  fun downloadUpdate(request: ReadableMap, promise: Promise) {
    try {
      val url = request.getString("url")
        ?: throw IllegalArgumentException("url is required")
      val version = request.getString("version")
        ?: throw IllegalArgumentException("version is required")
      val requestedFileName = request.getString("fileName")
        ?: "EXIF_Helper-v$version.apk"
      val fileName = updateApkFileName(requestedFileName, version)
      val outputFile = File(updateDirectory(), fileName)
      val tempFile = File(updateDirectory(), "$fileName.download")

      deleteDownloadedUpdateFiles()
      downloadFile(url, tempFile)
      if (!tempFile.renameTo(outputFile)) {
        tempFile.copyTo(outputFile, overwrite = true)
        tempFile.delete()
      }

      val update = validateDownloadedUpdate(outputFile)
      promise.resolve(update.toWritableMap())
    } catch (error: Exception) {
      deleteDownloadedUpdateFiles()
      promise.reject("UPDATE_DOWNLOAD_FAILED", error.message ?: "无法下载更新安装包", error)
    }
  }

  @ReactMethod
  fun deleteDownloadedUpdate(promise: Promise) {
    try {
      val deleted = deleteDownloadedUpdateFiles()
      promise.resolve(deleted)
    } catch (error: Exception) {
      promise.reject("UPDATE_DELETE_FAILED", error.message ?: "删除失败", error)
    }
  }

  @ReactMethod
  fun installDownloadedUpdate(promise: Promise) {
    try {
      val update = validDownloadedUpdateOrNull()
        ?: throw IllegalStateException("没有可安装的更新包")
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
        !reactContext.packageManager.canRequestPackageInstalls()
      ) {
        val settingsIntent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
          data = Uri.parse("package:${reactContext.packageName}")
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(settingsIntent)
        promise.resolve(Arguments.createMap().apply {
          putString("status", "needsPermission")
        })
        return
      }

      val apkUri = FileProvider.getUriForFile(
        reactContext,
        "${reactContext.packageName}.fileprovider",
        update.file
      )
      val installIntent = Intent(Intent.ACTION_VIEW).apply {
        setDataAndType(apkUri, APK_MIME_TYPE)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      reactContext.startActivity(installIntent)
      promise.resolve(Arguments.createMap().apply {
        putString("status", "opened")
      })
    } catch (error: Exception) {
      promise.reject("UPDATE_INSTALL_FAILED", error.message ?: "无法打开系统安装器", error)
    }
  }

  private fun processTarget(
    targetUri: String,
    index: Int,
    sourceAttributes: List<Pair<String, String>>,
    pngOutputMode: String
  ): WritableMap {
    return try {
      val targetDisplayName = displayNameFromUri(targetUri)
      val targetFile = copyUriToCache(targetUri, "target_$index")
      val extension = detectExtension(targetFile, targetUri)
      if (!SUPPORTED_EXTENSIONS.contains(extension)) {
        return failure(targetUri, "暂不支持写入 .$extension 文件", targetDisplayName)
      }
      val outputExtension = if (extension == "png" && pngOutputMode == PNG_OUTPUT_MODE_JPEG) "jpg" else extension

      val workingFile = File(reactContext.cacheDir, "exif_clone_work_${System.nanoTime()}.$outputExtension")
      if (extension == "png" && outputExtension == "jpg") {
        convertPngToJpeg(targetFile, workingFile)
      } else {
        FileInputStream(targetFile).use { input ->
          FileOutputStream(workingFile).use { output ->
            input.copyTo(output)
          }
        }
      }

      val targetExif = ExifInterface(workingFile.absolutePath)
      sourceAttributes.forEach { (tag, value) ->
        targetExif.setAttribute(tag, value)
      }
      targetExif.saveAttributes()

      val verificationExif = ExifInterface(workingFile.absolutePath)
      val failedTags = sourceAttributes
        .filter { (tag, value) -> !exifValuesMatch(tag, value, verificationExif.getAttribute(tag)) }
        .map { it.first }

      val outputUri = saveToPictures(workingFile, outputExtension, targetDisplayName)
      success(targetUri, outputUri.toString(), targetDisplayName, failedTags)
    } catch (error: Exception) {
      failure(targetUri, error.message ?: "未知错误", displayNameFromUri(targetUri))
    }
  }

  private fun convertPngToJpeg(inputFile: File, outputFile: File) {
    val sourceBitmap = BitmapFactory.decodeFile(inputFile.absolutePath)
      ?: throw IllegalArgumentException("无法把 PNG 目标图片另存为 JPEG")
    val jpegBitmap = Bitmap.createBitmap(sourceBitmap.width, sourceBitmap.height, Bitmap.Config.ARGB_8888)
    try {
      Canvas(jpegBitmap).apply {
        drawColor(Color.WHITE)
        drawBitmap(sourceBitmap, 0f, 0f, null)
      }
      FileOutputStream(outputFile).use { output ->
        if (!jpegBitmap.compress(Bitmap.CompressFormat.JPEG, JPEG_QUALITY, output)) {
          throw IllegalStateException("无法写入 JPEG 输出图片")
        }
      }
    } finally {
      sourceBitmap.recycle()
      jpegBitmap.recycle()
    }
  }

  private fun copyUriToCache(uriString: String, prefix: String): File {
    val uri = Uri.parse(uriString)
    val extension = guessExtension(uriString, contentType(uri))
    val output = File(reactContext.cacheDir, "${prefix}_${System.nanoTime()}.$extension")

    when (uri.scheme) {
      "file", null -> {
        val inputFile = if (uri.scheme == "file") File(requireNotNull(uri.path)) else File(uriString)
        FileInputStream(inputFile).use { input ->
          FileOutputStream(output).use { fileOutput ->
            input.copyTo(fileOutput)
          }
        }
      }
      else -> {
        openInputStreamWithOriginalMediaFallback(uri).use { input ->
          if (input == null) {
            throw IllegalArgumentException("无法打开图片：$uriString")
          }
          FileOutputStream(output).use { fileOutput ->
            input.copyTo(fileOutput)
          }
        }
      }
    }

    return output
  }

  private fun openInputStreamWithOriginalMediaFallback(uri: Uri): java.io.InputStream? {
    val readableUri = readableMediaUri(uri)
    return try {
      reactContext.contentResolver.openInputStream(readableUri)
    } catch (error: Exception) {
      if (readableUri == uri) {
        throw error
      }
      reactContext.contentResolver.openInputStream(uri)
    }
  }

  private fun readableMediaUri(uri: Uri): Uri {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q || uri.scheme != "content") {
      return uri
    }
    if (reactContext.checkSelfPermission(android.Manifest.permission.ACCESS_MEDIA_LOCATION) != PackageManager.PERMISSION_GRANTED) {
      return uri
    }
    return try {
      MediaStore.setRequireOriginal(uri)
    } catch (_: Exception) {
      uri
    }
  }

  private fun collectPickedUris(data: Intent): List<Uri> {
    val result = linkedSetOf<Uri>()
    data.data?.let { result.add(it) }
    val clipData = data.clipData
    if (clipData != null) {
      for (index in 0 until clipData.itemCount) {
        clipData.getItemAt(index).uri?.let { result.add(it) }
      }
    }
    return result.toList()
  }

  private fun persistReadPermission(data: Intent, uri: Uri) {
    val flags = data.flags and (Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
    if (flags and Intent.FLAG_GRANT_READ_URI_PERMISSION == 0) {
      return
    }
    try {
      reactContext.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
    } catch (_: SecurityException) {
      // Some providers grant temporary access only. The current operation can still use it.
    }
  }

  private fun photoInfo(uri: Uri): WritableMap {
    val resolver = reactContext.contentResolver
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    resolver.openInputStream(uri).use { input ->
      if (input != null) {
        BitmapFactory.decodeStream(input, null, bounds)
      }
    }
    val fileData = queryOpenableFile(uri)
    val mimeType = contentType(uri) ?: detectMimeTypeFromHeader(uri)
    return Arguments.createMap().apply {
      putString("uri", uri.toString())
      putString("fileName", fileData?.first)
      putString("mimeType", mimeType)
      putInt("width", bounds.outWidth.coerceAtLeast(0))
      putInt("height", bounds.outHeight.coerceAtLeast(0))
    }
  }

  private fun queryOpenableFile(uri: Uri): Pair<String?, Long?>? {
    return reactContext.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
      if (!cursor.moveToFirst()) {
        return@use null
      }
      val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
      val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
      val name = if (nameIndex >= 0) cursor.getString(nameIndex) else null
      val size = if (sizeIndex >= 0) cursor.getLong(sizeIndex) else null
      name to size
    }
  }

  private fun saveToPictures(file: File, extension: String, sourceDisplayName: String?): Uri {
    val resolver = reactContext.contentResolver
    val mimeType = when (extension) {
      "png" -> "image/png"
      else -> "image/jpeg"
    }
    val displayName = exportDisplayName(sourceDisplayName, extension)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      val values = ContentValues().apply {
        put(MediaStore.Images.Media.DISPLAY_NAME, displayName)
        put(MediaStore.Images.Media.MIME_TYPE, mimeType)
        put(MediaStore.Images.Media.RELATIVE_PATH, "${Environment.DIRECTORY_PICTURES}/EXIF助手")
        put(MediaStore.Images.Media.IS_PENDING, 1)
      }
      val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
        ?: throw IllegalStateException("无法创建输出图片")
      resolver.openOutputStream(uri).use { output ->
        if (output == null) {
          throw IllegalStateException("无法打开输出图片")
        }
        FileInputStream(file).use { input ->
          input.copyTo(output)
        }
      }
      values.clear()
      values.put(MediaStore.Images.Media.IS_PENDING, 0)
      resolver.update(uri, values, null, null)
      return uri
    }

    @Suppress("DEPRECATION")
    val picturesDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES)
    val outputDir = File(picturesDir, "EXIF助手")
    if (!outputDir.exists() && !outputDir.mkdirs()) {
      throw IllegalStateException("无法创建输出目录")
    }
    val outputFile = File(outputDir, displayName)
    FileInputStream(file).use { input ->
      FileOutputStream(outputFile).use { output ->
        input.copyTo(output)
      }
    }

    val values = ContentValues().apply {
      put(MediaStore.Images.Media.DATA, outputFile.absolutePath)
      put(MediaStore.Images.Media.DISPLAY_NAME, displayName)
      put(MediaStore.Images.Media.MIME_TYPE, mimeType)
    }
    return resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
      ?: Uri.fromFile(outputFile)
  }

  private fun detectExtension(file: File, sourceUri: String): String {
    FileInputStream(file).use { input ->
      val header = ByteArray(8)
      val read = input.read(header)
      if (read >= 8 &&
        header[0] == 0x89.toByte() &&
        header[1] == 0x50.toByte() &&
        header[2] == 0x4E.toByte() &&
        header[3] == 0x47.toByte()
      ) {
        return "png"
      }
      if (read >= 2 && header[0] == 0xFF.toByte() && header[1] == 0xD8.toByte()) {
        return "jpg"
      }
    }
    val fromUri = guessExtension(sourceUri, contentType(Uri.parse(sourceUri)))
    return fromUri
  }

  private fun detectMimeTypeFromHeader(uri: Uri): String? {
    reactContext.contentResolver.openInputStream(uri).use { input ->
      if (input == null) {
        return null
      }
      val header = ByteArray(8)
      val read = input.read(header)
      if (read >= 8 &&
        header[0] == 0x89.toByte() &&
        header[1] == 0x50.toByte() &&
        header[2] == 0x4E.toByte() &&
        header[3] == 0x47.toByte()
      ) {
        return "image/png"
      }
      if (read >= 2 && header[0] == 0xFF.toByte() && header[1] == 0xD8.toByte()) {
        return "image/jpeg"
      }
    }
    return null
  }

  private fun guessExtension(uriString: String, mimeType: String?): String {
    val lower = uriString.substringBefore('?').lowercase()
    return when {
      lower.endsWith(".jpeg") -> "jpeg"
      lower.endsWith(".jpg") -> "jpg"
      lower.endsWith(".png") -> "png"
      mimeType == "image/png" -> "png"
      mimeType == "image/jpeg" -> "jpg"
      else -> "jpg"
    }
  }

  private fun contentType(uri: Uri): String? {
    return try {
      if (uri.scheme == "content") reactContext.contentResolver.getType(uri) else null
    } catch (_: Exception) {
      null
    }
  }

  private fun displayNameFromUri(uriString: String): String? {
    val uri = Uri.parse(uriString)
    if (uri.scheme == "content") {
      queryOpenableFile(uri)?.first?.let { name ->
        if (name.isNotBlank()) {
          return name.substringAfterLast('/').substringAfterLast('\\')
        }
      }
    }
    val segment = uri.lastPathSegment ?: return null
    return Uri.decode(segment).substringAfterLast('/').substringAfterLast('\\')
  }

  private fun exportDisplayName(sourceDisplayName: String?, extension: String): String {
    val timestamp = SimpleDateFormat(EXPORT_TIMESTAMP_PATTERN, Locale.US).format(Date())
    val baseName = exportBaseName(sourceDisplayName)
    return "${baseName}_exifhelper_$timestamp.$extension"
  }

  private fun exportBaseName(sourceDisplayName: String?): String {
    val sanitized = sanitizeFileName(sourceDisplayName)
    val dotIndex = sanitized.lastIndexOf('.')
    val baseName = if (dotIndex > 0) sanitized.substring(0, dotIndex) else sanitized
    return baseName.ifBlank { EXPORT_FALLBACK_BASENAME }
  }

  private fun sanitizeFileName(name: String?): String {
    val raw = name?.trim().orEmpty()
    val sanitized = raw.map { char ->
      when {
        char <= '\u001F' -> '_'
        char == '/' || char == '\\' || char == ':' || char == '*' || char == '?' -> '_'
        char == '"' || char == '<' || char == '>' || char == '|' -> '_'
        else -> char
      }
    }.joinToString("").trim().trimEnd('.')
    return sanitized.ifBlank { EXPORT_FALLBACK_BASENAME }
  }

  private fun exifValuesMatch(tag: String, expected: String, actual: String?): Boolean {
    if (actual == null) {
      return false
    }
    if (expected == actual) {
      return true
    }

    return when (tag) {
      ExifInterface.TAG_GPS_LATITUDE,
      ExifInterface.TAG_GPS_LONGITUDE,
      ExifInterface.TAG_GPS_ALTITUDE,
      ExifInterface.TAG_FOCAL_LENGTH,
      ExifInterface.TAG_EXPOSURE_TIME,
      ExifInterface.TAG_F_NUMBER,
      ExifInterface.TAG_EXPOSURE_BIAS_VALUE,
      ExifInterface.TAG_APERTURE_VALUE,
      ExifInterface.TAG_SHUTTER_SPEED_VALUE,
      ExifInterface.TAG_BRIGHTNESS_VALUE -> rationalEquals(expected, actual)
      else -> expected.trim() == actual.trim()
    }
  }

  private fun rationalEquals(left: String, right: String): Boolean {
    val leftValue = parseRational(left) ?: return left.trim() == right.trim()
    val rightValue = parseRational(right) ?: return left.trim() == right.trim()
    return kotlin.math.abs(leftValue - rightValue) < 0.000001
  }

  private fun parseRational(value: String): Double? {
    val trimmed = value.trim()
    val parts = trimmed.split("/")
    if (parts.size == 2) {
      val numerator = parts[0].toDoubleOrNull() ?: return null
      val denominator = parts[1].toDoubleOrNull() ?: return null
      if (denominator == 0.0) {
        return null
      }
      return numerator / denominator
    }
    return trimmed.toDoubleOrNull()
  }

  private fun success(targetUri: String, outputUri: String, fileName: String?, failedTags: List<String>): WritableMap {
    return Arguments.createMap().apply {
      putString("targetUri", targetUri)
      putString("outputUri", outputUri)
      putString("fileName", fileName)
      putBoolean("success", true)
      if (failedTags.isNotEmpty()) {
        val failedTagArray = Arguments.createArray()
        failedTags.forEach { failedTagArray.pushString(it) }
        putString("warning", "部分标签写入后未通过校验")
        putArray("failedTags", failedTagArray)
      }
    }
  }

  private fun failure(targetUri: String, message: String, fileName: String?): WritableMap {
    return Arguments.createMap().apply {
      putString("targetUri", targetUri)
      putString("fileName", fileName)
      putBoolean("success", false)
      putString("error", message)
    }
  }

  private fun currentPackageInfo() =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      reactContext.packageManager.getPackageInfo(
        reactContext.packageName,
        PackageManager.PackageInfoFlags.of(0)
      )
    } else {
      @Suppress("DEPRECATION")
      reactContext.packageManager.getPackageInfo(reactContext.packageName, 0)
    }

  private fun archivePackageInfo(file: File) =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      reactContext.packageManager.getPackageArchiveInfo(
        file.absolutePath,
        PackageManager.PackageInfoFlags.of(0)
      )
    } else {
      @Suppress("DEPRECATION")
      reactContext.packageManager.getPackageArchiveInfo(file.absolutePath, 0)
    }

  private fun packageVersionCode(packageInfo: android.content.pm.PackageInfo): Long {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      packageInfo.longVersionCode
    } else {
      @Suppress("DEPRECATION")
      packageInfo.versionCode.toLong()
    }
  }

  private fun updateDirectory(): File {
    val directory = File(reactContext.filesDir, UPDATE_DIRECTORY_NAME)
    if (!directory.exists() && !directory.mkdirs()) {
      throw IllegalStateException("无法创建更新包目录")
    }
    return directory
  }

  private fun validDownloadedUpdateOrNull(): DownloadedUpdate? {
    val file = updateDirectory()
      .listFiles()
      ?.filter { it.isFile && it.extension.lowercase(Locale.US) == "apk" }
      ?.maxByOrNull { it.lastModified() }
      ?: return null
    return try {
      validateDownloadedUpdate(file)
    } catch (_: Exception) {
      file.delete()
      null
    }
  }

  private fun validateDownloadedUpdate(file: File): DownloadedUpdate {
    val archiveInfo = archivePackageInfo(file)
      ?: throw IllegalArgumentException("安装包无效")
    val currentInfo = currentPackageInfo()
    val archiveVersion = archiveInfo.versionName
      ?: throw IllegalArgumentException("安装包缺少版本号")
    val currentVersion = currentInfo.versionName ?: "0.0.0"

    if (archiveInfo.packageName != reactContext.packageName) {
      throw IllegalArgumentException("安装包不是当前应用")
    }
    if (compareSemanticVersions(archiveVersion, currentVersion) <= 0) {
      throw IllegalArgumentException("安装包版本不高于当前版本")
    }

    return DownloadedUpdate(
      file = file,
      packageName = archiveInfo.packageName,
      versionName = archiveVersion,
      versionCode = packageVersionCode(archiveInfo),
    )
  }

  private fun downloadFile(urlString: String, outputFile: File) {
    val connection = URL(urlString).openConnection() as HttpURLConnection
    connection.instanceFollowRedirects = true
    connection.connectTimeout = UPDATE_CONNECT_TIMEOUT_MS
    connection.readTimeout = UPDATE_READ_TIMEOUT_MS
    connection.setRequestProperty("Accept", APK_MIME_TYPE)
    try {
      val responseCode = connection.responseCode
      if (responseCode !in 200..299) {
        throw IllegalStateException("下载接口返回 $responseCode")
      }
      connection.inputStream.use { input ->
        FileOutputStream(outputFile).use { output ->
          input.copyTo(output)
        }
      }
      if (!outputFile.exists() || outputFile.length() <= 0L) {
        throw IllegalStateException("安装包内容为空")
      }
    } finally {
      connection.disconnect()
    }
  }

  private fun deleteDownloadedUpdateFiles(): Boolean {
    val directory = updateDirectory()
    var deletedAny = false
    directory.listFiles()?.forEach { file ->
      if (file.isFile && (file.extension.lowercase(Locale.US) == "apk" || file.name.endsWith(".download"))) {
        deletedAny = file.delete() || deletedAny
      }
    }
    return deletedAny
  }

  private fun updateApkFileName(requestedName: String, version: String): String {
    val sanitized = sanitizeFileName(requestedName)
    val withExtension = if (sanitized.lowercase(Locale.US).endsWith(".apk")) {
      sanitized
    } else {
      "$sanitized.apk"
    }
    return withExtension.ifBlank { "EXIF_Helper-v$version.apk" }
  }

  private fun compareSemanticVersions(left: String, right: String): Int {
    val leftParts = semanticVersionParts(left)
    val rightParts = semanticVersionParts(right)
    val maxLength = maxOf(leftParts.size, rightParts.size)
    for (index in 0 until maxLength) {
      val leftValue = leftParts.getOrElse(index) { 0 }
      val rightValue = rightParts.getOrElse(index) { 0 }
      if (leftValue > rightValue) {
        return 1
      }
      if (leftValue < rightValue) {
        return -1
      }
    }
    return 0
  }

  private fun semanticVersionParts(version: String): List<Int> {
    return version.trim()
      .removePrefix("v")
      .removePrefix("V")
      .split(".", "+", "-")
      .mapNotNull { it.toIntOrNull() }
  }

  private fun DownloadedUpdate.toWritableMap(): WritableMap {
    return Arguments.createMap().apply {
      putString("fileName", file.name)
      putString("filePath", file.absolutePath)
      putString("packageName", packageName)
      putString("versionName", versionName)
      putDouble("versionCode", versionCode.toDouble())
      putDouble("size", file.length().toDouble())
    }
  }

  private fun ReadableArray.toStringList(): List<String> {
    val result = mutableListOf<String>()
    for (index in 0 until size()) {
      getString(index)?.let { result.add(it) }
    }
    return result
  }

  companion object {
    private const val PICK_IMAGES_REQUEST_CODE = 41001
    private const val PICK_MODE_GALLERY = "gallery"
    private const val PICK_MODE_FILES = "files"
    private const val PNG_OUTPUT_MODE_PNG = "png"
    private const val PNG_OUTPUT_MODE_JPEG = "jpeg"
    private const val JPEG_QUALITY = 95
    private const val UPDATE_DIRECTORY_NAME = "updates"
    private const val APK_MIME_TYPE = "application/vnd.android.package-archive"
    private const val UPDATE_CONNECT_TIMEOUT_MS = 15000
    private const val UPDATE_READ_TIMEOUT_MS = 30000
    private const val EXPORT_TIMESTAMP_PATTERN = "yyyyMMdd_HHmmss"
    private const val EXPORT_FALLBACK_BASENAME = "image"
    private val SUPPORTED_EXTENSIONS = setOf("jpg", "jpeg", "png")

    private val CLONE_TAGS = listOf(
      ExifInterface.TAG_DATETIME_ORIGINAL,
      ExifInterface.TAG_DATETIME_DIGITIZED,
      ExifInterface.TAG_DATETIME,
      ExifInterface.TAG_SUBSEC_TIME_ORIGINAL,
      ExifInterface.TAG_SUBSEC_TIME_DIGITIZED,
      ExifInterface.TAG_SUBSEC_TIME,
      ExifInterface.TAG_OFFSET_TIME_ORIGINAL,
      ExifInterface.TAG_OFFSET_TIME_DIGITIZED,
      ExifInterface.TAG_OFFSET_TIME,
      ExifInterface.TAG_GPS_LATITUDE,
      ExifInterface.TAG_GPS_LATITUDE_REF,
      ExifInterface.TAG_GPS_LONGITUDE,
      ExifInterface.TAG_GPS_LONGITUDE_REF,
      ExifInterface.TAG_GPS_ALTITUDE,
      ExifInterface.TAG_GPS_ALTITUDE_REF,
      ExifInterface.TAG_GPS_DATESTAMP,
      ExifInterface.TAG_GPS_TIMESTAMP,
      ExifInterface.TAG_GPS_PROCESSING_METHOD,
      ExifInterface.TAG_GPS_MAP_DATUM,
      ExifInterface.TAG_MAKE,
      ExifInterface.TAG_MODEL,
      ExifInterface.TAG_SOFTWARE,
      ExifInterface.TAG_IMAGE_WIDTH,
      ExifInterface.TAG_IMAGE_LENGTH,
      ExifInterface.TAG_ORIENTATION,
      ExifInterface.TAG_LENS_MAKE,
      ExifInterface.TAG_LENS_MODEL,
      ExifInterface.TAG_LENS_SPECIFICATION,
      ExifInterface.TAG_FOCAL_LENGTH,
      ExifInterface.TAG_FOCAL_LENGTH_IN_35MM_FILM,
      ExifInterface.TAG_EXPOSURE_TIME,
      ExifInterface.TAG_F_NUMBER,
      ExifInterface.TAG_ISO_SPEED_RATINGS,
      ExifInterface.TAG_PHOTOGRAPHIC_SENSITIVITY,
      ExifInterface.TAG_EXPOSURE_BIAS_VALUE,
      ExifInterface.TAG_EXPOSURE_PROGRAM,
      ExifInterface.TAG_METERING_MODE,
      ExifInterface.TAG_FLASH,
      ExifInterface.TAG_WHITE_BALANCE,
      ExifInterface.TAG_APERTURE_VALUE,
      ExifInterface.TAG_SHUTTER_SPEED_VALUE,
      ExifInterface.TAG_BRIGHTNESS_VALUE,
    )
  }

  private data class DownloadedUpdate(
    val file: File,
    val packageName: String,
    val versionName: String,
    val versionCode: Long,
  )
}
