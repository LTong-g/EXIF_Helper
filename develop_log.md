# 开发日志

## 撰写规则

- 本日志记录项目开发过程中的需求理解、方案、实现、验证、事故、阶段回顾和版本准备事实。
- 本日志默认只能追加记录，不删除、不改写历史内容；除非用户明确要求。
- 追加记录必须写到对应日期下；若当天日期标题不存在，先创建当天日期标题。
- 每天只保留一个二级日期标题，格式为 `## YYYY-MM-DD`。
- 每次新增事件必须使用三级标题，格式为 `### 事件标题`。
- 事件标题必须描述单一事件，禁止使用“继续”“更新”“杂项”“延续上个话题”等模糊标题。
- 同一日期下发生不同性质事项时，必须拆成多个三级标题分别记录。
- 分析方案、代码实现、验证结果、事故复盘、版本更新必须分开记录，不得混写在同一标题下。
- 标题下使用 `-` 分点记录事实。
- 每条记录只写已经发生的事实、已经形成的方案、已经识别的风险、已经执行的验证或当前明确的缺口。
- 不把尚未执行的下一步计划写成已完成事实。
- 需要记录后续工作时，使用“剩余缺口”或“后续待处理”表述，并说明它尚未完成。
- 用户提出功能需求并要求方案时，必须记录需求理解、目标效果、实现方案、风险边界和本轮不做范围。
- 每次实质性代码改动后，必须记录改动内容、影响范围和对应验证。
- 验证记录必须写清验证对象、执行方式和观察结果；禁止只写“验证通过”“无问题”等空泛结论。
- 无法验证时，必须记录无法验证的原因、风险和替代检查。
- 发生误改、误删、误提交、构建异常、环境异常或需求理解偏差时，必须记录事故事实、影响范围、修复方式和防止复发的规则调整。
- 用户纠正需求、方案、表达方式或协作规则时，必须记录纠正内容和已做调整。
- 版本更新必须单独记录一条日志，不得混在功能实现记录里。
- 开发日志不得记录 token、密钥、密码、证书指纹、私有签名材料、未脱敏用户隐私、本机私有绝对路径或可复用凭据。
- 记录本机环境时使用泛化表述，例如“本机 Android SDK 路径”“项目原始长路径”“临时映射路径”。
- 开发日志不是版本记录；版本记录只写用户可感知的最终变化。
- 开发日志新增 5-10 条实质记录后，应做一次阶段回顾。
- 阶段回顾必须记录总目标、当前进度、已完成内容、剩余缺口、下一步方案、验收方式和完成后离总目标还差什么。

## 日志内容

## 2026-05-11

### 确认 EXIF助手 v0.1 需求范围

- 用户确认项目只做 Android，不做 iOS，不以上架应用商店为初版目标。
- 用户确认应用名为“EXIF助手”。
- 用户确认初版采用 Expo、React Native 和 TypeScript 方向开发。
- 用户确认 v0.1 需要同时支持 jpg、jpeg 和 png 写入，不再采用只支持 JPEG 的旧范围。
- 用户确认克隆范围需要包含时间、地理位置、时区、相机信息、镜头信息和曝光参数。
- 用户确认所有元数据项都要以复选框展示，应用只克隆用户勾选的项目。
- 用户确认主页面只选择源照片和目标照片，目标照片数量不设置应用内上限。
- 用户确认主页面底部使用“设置克隆”按钮，点击后进入新页面勾选克隆内容。
- 已将上述项目定位和长期规则同步到 `AGENTS.md`。

### 形成 EXIF助手 v0.1 初版方案边界

- 目标效果：用户在主页面选择一张源照片和任意数量目标照片，点击“设置克隆”进入克隆内容页面，勾选需要克隆的元数据项后执行克隆，并在结果页看到成功、失败和失败原因。
- 实现方案：Expo 层负责页面、选择器、状态管理和结果展示；元数据读取与写入优先评估 Expo 可用能力，不足时通过 Android 原生模块接入 `androidx.exifinterface.media.ExifInterface`。
- 实现方案：源照片元数据读取后按分组展示为复选框，包括时间、时区、GPS、相机、镜头和曝光参数；目标照片处理采用逐张复制、写入和保存结果的流水线。
- 风险边界：Android Photo Picker 和 Expo ImagePicker 更适合读取或导入文件，不等同于获得原文件原地写入权限；对其他应用创建的媒体文件原地覆盖需要 MediaStore、SAF 或用户明确授权，兼容性和失败面更高。
- 风险边界：PNG 的 EXIF 写入能力依赖 AndroidX ExifInterface 和设备/系统组件表现，后续实现必须用真实样张验证，不凭接口存在直接宣称完全兼容。
- 本轮不做：不设计 iOS 方案，不做云同步、账号、联网服务、应用商店发布流程、完整 MakerNote 编辑或无提示覆盖原文件。

### 检查开发环境准备状态

- 已检查本机基础开发链路：Node、npm、Java 和 adb 均可执行。
- 已确认 Android SDK 环境变量可读取，`ANDROID_HOME` 和 `ANDROID_SDK_ROOT` 均已指向本机 Android SDK 路径。
- 当前仓库尚未初始化 Expo 项目文件，目录中未发现 `package.json`。
- 执行 `git status --short` 时被 Git dubious ownership 安全检查拦截，原因是仓库所有者和当前运行用户不一致。
- 剩余缺口：开发前需要将当前仓库加入 Git safe.directory，后续初始化 Expo 项目还需要联网安装 npm 依赖。

### 确认 Android SDK 与 Expo SDK 匹配方案

- 已检查本机 Android SDK，已安装 Android SDK Platform 34 和 35，未安装 Android SDK Platform 36。
- 已检查本机 Android Build Tools，已安装 34.0.0、35.0.0 和 36.0.0。
- 用户要求避免后续安装新的 Android SDK Platform。
- 已确认 Expo SDK 54 和 55 会要求 Android API 36，不符合当前环境约束。
- 已选择 Expo SDK 53 作为项目基线，因为它使用 compileSdk 35 和 targetSdk 35，能匹配本机已安装 Android SDK Platform 35。

### 实现 EXIF助手 v0.1 初版应用

- 已初始化 Expo SDK 53、React Native 0.79、TypeScript 项目。
- 已实现主页面，用户可选择一张源照片和任意数量目标照片，底部提供“设置克隆”按钮。
- 已实现克隆内容页面，按时间与时区、地理位置、相机信息、镜头信息和曝光参数分组展示元数据项，每项使用开关式复选控件。
- 已实现结果页，展示每张目标照片的成功或失败状态、输出 URI 或失败原因。
- 已实现 Android Kotlin 原生模块 `ExifCloneModule`，通过 AndroidX ExifInterface 读取源照片元数据，并把勾选字段写入目标照片副本。
- 已实现 jpg、jpeg、png 扩展名和文件头识别，目标格式不在支持范围时返回失败结果。
- 已实现写入后重新读取校验，校验失败时返回失败标签列表。
- 已实现输出到系统图片库 `Pictures/EXIF助手`，当前版本不覆盖原图。
- 已将应用名资源修正为“EXIF助手”，避免 Windows 编码导致 Android 桌面名称乱码。
- 已补充 `README.md` 和 MIT `LICENSE`。

### 验证 EXIF助手 v0.1 构建结果

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 Android debug 构建 `gradlew.bat assembleDebug`。
- 构建输出显示 Expo SDK 53 工程使用 buildTools 35.0.0、compileSdk 35、targetSdk 35、minSdk 24，未要求安装 Android SDK Platform 36。
- Android debug 构建成功，生成 APK 位于 `android/app/build/outputs/apk/debug/app-debug.apk`。
- 剩余缺口：尚未在真机上用真实 jpg、jpeg 和 png 样张验证元数据读取、写入后相册显示和第三方 EXIF 工具识别效果。

### 修复手动安装 APK 启动方式

- 用户反馈安装 debug APK 后无法打开，界面提示 development build 缺少 INTERNET 权限并无法加载项目。
- 已确认原因是 debug APK 属于 Expo development build，会尝试连接 Metro 开发服务器；项目按隐私目标移除了 INTERNET 权限，因此 debug APK 不适合离线手动验收。
- 已执行 `gradlew.bat assembleRelease` 构建 release APK，构建过程已打包 JS bundle。
- release 构建继续使用 buildTools 35.0.0、compileSdk 35、targetSdk 35，没有要求安装 Android SDK Platform 36。
- release APK 构建成功，输出位置为 `android/app/build/outputs/apk/release/app-release.apk`。
- 已将 README 改为英文内容，避免 Windows 编码导致中文 Markdown 被污染。

### 区分 debug 和 release 网络权限

- 用户要求 debug 包保留联网权限以方便 Expo Dev Client 开发，release 包继续不要求联网权限。
- 已将主 Android manifest 中的 `INTERNET` 权限恢复为 debug 可用。
- 已新增 release manifest overlay，在 release 构建中移除 `INTERNET` 权限。
- 已重新执行 `gradlew.bat assembleDebug` 和 `gradlew.bat assembleRelease`，两个构建均成功。
- 已检查合并后的 debug manifest，确认包含 `android.permission.INTERNET`。
- 已检查合并后的 release manifest，确认不包含 `android.permission.INTERNET`。
- 已更新 README，说明 debug 和 release 的网络权限差异。

### 修复 debug 包连接 Metro 后卡加载

- 用户反馈已配置 Metro 后 debug 包仍卡在加载界面。
- 已通过模拟器 logcat 发现 debug 包连接 Metro 后出现 `Cannot find native module 'ExpoAsset'` 和 `No native ExponentConstants module found`，导致 JS 入口无法正常完成注册。
- 已将 `expo-asset` 和 `expo-constants` 按 Expo SDK 53 兼容版本加入应用直接依赖，确保 Expo autolinking 把对应 Android 原生模块编入自定义 dev build。
- 已确认重新构建 debug APK 时 Gradle 输出列出 `expo-constants` 和 `expo-asset` 模块。
- 已安装新的 debug APK 到模拟器，设置 `adb reverse tcp:8081 tcp:8081`，并通过 Expo Dev Client URL 启动。
- 已确认 logcat 不再出现缺失 `ExpoAsset`、缺失 `ExponentConstants` 或 `main has not been registered` 错误。
- 已确认模拟器主页面显示“EXIF助手”、源照片卡片、目标照片卡片和底部“设置克隆”按钮。
- 已更新 README，补充 debug 包连接 Metro 的安装、端口反向代理和启动命令。

### 验证 debug 卡加载修复后的构建状态

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `gradlew.bat assembleDebug`，debug APK 构建成功，构建输出确认 Expo modules 包含 `expo-constants` 和 `expo-asset`。
- 已执行 `gradlew.bat assembleRelease`，release APK 构建成功。
- 已检查 debug 合并 manifest，确认仍包含 `android.permission.INTERNET` 以支持 Expo Dev Client 连接 Metro。
- 已检查 release 合并 manifest，确认不包含 `android.permission.INTERNET`，符合离线 release 包目标。

### 设置英文系统应用名

- 用户确认如需区分中文和英文应用名，英文名使用 `EXIF Helper`。
- 已新增 Android `values-en` 字符串资源，在英文系统语言下将 `app_name` 显示为 `EXIF Helper`。
- 默认 `values` 资源继续保留中文 `EXIF助手`，用于中文和未匹配语言环境。

### 修复源照片选择反馈不明确

- 用户反馈点击“选择源照片”并选择照片后，界面仍像没有选上，并指出如果是照片没有元数据，应给出提示而不是静默回退。
- 已确认原流程会先设置源照片再读取元数据，但读取失败或读取结果为空时只依赖弹窗或预览空值，主页面缺少持久状态说明，容易被理解为没有选中照片。
- 已将源照片选择状态和元数据读取状态拆开：照片选中后保留照片缩略图、文件名和尺寸；读取中、读取成功、读取失败、未读取到可克隆元数据都会在源照片卡片内显示说明。
- 已在源照片读取不到当前版本支持的可克隆元数据时弹出“未读取到可克隆元数据”提示，并保留卡片内说明。
- 已在打开“设置克隆”前增加源元数据为空校验，避免进入没有可勾选项目的克隆内容页面。
- 已给目标照片选择增加系统选择器未返回照片和选择异常提示，避免类似静默失败。
- 已在 Android 原生读取入口保留 ExifInterface 可读即读的策略，源照片不限制为 jpg、jpeg、png。
- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `gradlew.bat assembleDebug`，Android debug 构建成功。

### 替换原生默认弹窗并脱敏错误信息

- 用户反馈弹窗中暴露了不应展示的底层报错信息，并指出原生默认灰色直角弹窗不符合应用界面要求。
- 已移除用户流程中的 `Alert.alert` 调用，改为 React Native `Modal` 实现应用内统一弹窗。
- 新弹窗使用半透明遮罩、白色 8px 圆角内容面板、信息/警告/错误状态圆形标识和统一“知道了”按钮。
- 已新增用户可见错误归类函数，将权限、无法打开文件、不支持格式、无可写入标签、写入校验失败等底层异常转成中文业务提示。
- 原始异常只通过 `console.warn` 输出给开发调试，不再直接展示给用户。
- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `gradlew.bat assembleDebug`，Android debug 构建成功。

### 更正源照片读取格式边界

- 用户指出源照片不应只允许 jpg、jpeg 和 png。
- 已确认 v0.1 的 jpg、jpeg、png 约束是目标照片写入格式约束，不应扩展成源照片读取限制。
- 已移除 `readMetadata` 中对源照片扩展名的 jpg、jpeg、png 限制，源照片改为只要 AndroidX ExifInterface 能读取出支持标签就允许使用。
- 已调整读取失败的用户提示，不再要求源照片必须是 jpg、jpeg 或 png。

### 修复源照片总是读不到元数据

- 用户反馈源照片选择任意照片都读不到元数据。
- 已检查 Expo ImagePicker Android 实现，确认其返回给 JS 的 `uri` 是导出到应用缓存目录的 `file://`，不是系统选择器返回的原始媒体 `content://`。
- 已识别风险：应用此前把 Expo 缓存文件交给原生 EXIF 读取，缓存副本可能缺失或裁剪元数据，导致有元数据的原图也显示为无可克隆项。
- 已新增 Android 原生 `pickImages` 方法，使用 `ACTION_OPEN_DOCUMENT` 直接返回原始 `content://` 图片 URI，并尝试持久化读取权限。
- 已让源照片和目标照片选择都改用原生 `pickImages`，不再依赖 Expo ImagePicker 返回的缓存文件 URI。
- 已新增原生照片信息读取，返回 URI、文件名、MIME、宽高，保持主页面缩略图和照片摘要可用。
- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `gradlew.bat assembleDebug`，Android debug 构建成功。
- 已将最新 debug APK 安装到连接设备，设置 Metro 反向代理并启动，logcat 显示 `Running "main"`，未出现启动错误。

### 增加相册图库选择入口

- 用户要求尽量走相册/图库界面选择照片，不希望主流程只能打开文件选择器，并询问是否可以在文件选择器中增加切换按钮。
- 已确认 Android 系统文件选择器内部不能由应用添加自定义切换按钮；应用只能在打开系统选择器前提供自己的入口。
- 已保留 SAF 文件选择入口，并新增系统相册/图库选择入口；主页面点击选择源照片或目标照片后，先显示应用内选择面板。
- 已将原生 `pickImages` 扩展为 `gallery` 和 `files` 两种模式：`gallery` 优先使用 Android Photo Picker/图库 Intent，`files` 继续使用 `ACTION_OPEN_DOCUMENT` 并尝试持久化读取权限。
- 已保持当前数据安全边界：选择照片只用于读取源图或目标图，写入仍输出到 `Pictures/EXIF助手` 副本，不请求广泛文件读写权限，也不覆盖原文件。
- 已同步 `README.md` 和 `AGENTS.md`，记录相册/图库与文件选择两个入口，以及系统选择器内部不可自定义按钮的边界。
- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 首次执行 `gradlew.bat assembleDebug` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按用户授权规则提权后重新执行，Android debug 构建成功。
- 已执行 `gradlew.bat assembleRelease`，Android release 构建成功；该结果仅作为离线包构建验证，不作为实时 UI/JS 调试方式。

### 更正实时调试安装方式

- 用户指出不要安装 release 包，因为 release 包无法实时查看当前开发改动。
- 已接受该验证边界：实时查看 UI 或 JS 改动时使用 debug 包连接 Metro，release 包只作为最终离线验收包。
- 已停止使用 release 包做当前 UI 改动验收，并改回 debug 包验证路径。
- 已将连接设备切回安装 debug APK，执行 `adb reverse tcp:8081 tcp:8081`，并通过 Expo Dev Client URL 启动开发包。
- 已将该规则同步到 `AGENTS.md`，后续调试不再用 release 包替代 debug 包。

### 调整写入后校验失败处理

- 用户反馈克隆结果出现“写入后校验失败”。
- 已确认原生层此前采用严格字符串校验：所有源标签写入后逐项读取，任意一个标签读取值与源字符串不完全一致就判定整张目标照片失败。
- 已识别该策略对 EXIF 写入过严：AndroidX ExifInterface 可能对 GPS、曝光、焦距等有理数值做格式规范化，也可能对 PNG 或部分目标文件拒写某些标签。
- 已将校验策略调整为：副本成功保存时仍返回成功；未通过校验的标签作为 `warning` 和 `failedTags` 返回，不再让整张照片直接失败。
- 已为 GPS、焦距、曝光、光圈等有理数字段增加数值等价校验，避免 `1/2` 与等价值格式差异造成误判。
- 已在结果页增加“部分”状态，显示副本已保存但部分标签未通过校验，并用中文标签名列出未通过项。
- 已补充当用户勾选项在源照片中没有可用值时的业务提示。
- 已同步 `README.md`，说明写入后可能存在部分标签规范化或拒写，应用会保留副本并报告部分校验结果。

### 修复源照片 GPS 元数据被隐藏

- 用户反馈源照片仍读不到全部元数据，GPS 相关数据被抹去。
- 已确认 Android 10 及以上会对媒体文件中的照片位置信息做隐私保护，未声明并授予 `ACCESS_MEDIA_LOCATION` 时，EXIF GPS 可能被系统隐藏。
- 已在 Android manifest 中声明 `ACCESS_MEDIA_LOCATION`。
- 已在源照片选择前请求照片位置信息权限，并在用户未授予权限且 GPS 缺失时显示业务提示。
- 已在原生读取 `content://` 时优先使用 `MediaStore.setRequireOriginal()` 打开原始媒体 URI，读取失败时回退普通 URI。
- 已调整单张相册/图库选择入口：源照片单选不再优先走 Android 13+ Photo Picker，而是走 MediaStore 相册 URI，以降低 Photo Picker 对位置元数据脱敏的影响；目标多选继续可走 Photo Picker。
- 已同步 `README.md` 和 `AGENTS.md`，记录 Android 源照片 GPS 读取需要照片位置信息权限和原始媒体流。
- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `gradlew.bat assembleDebug`，Android debug 构建成功，debug 合并 manifest 中包含 `android.permission.ACCESS_MEDIA_LOCATION`。
- 首次 `adb install -r` 更新设备时超时，设备权限清单未出现 `ACCESS_MEDIA_LOCATION`；已改用 `adb install -r -t -g --no-streaming` 安装成功。
- 已检查设备上 `com.local.exifhelper` 权限清单，确认已请求并授予 `ACCESS_MEDIA_LOCATION`。
- 已执行 `adb reverse tcp:8081 tcp:8081` 并通过 Expo Dev Client URL 启动 debug 包。

### 修复主页顶部被状态栏或摄像头遮挡

- 用户反馈主页顶部需要给任务栏、摄像头等系统区域预留位置，避免标题文字被遮挡。
- 已确认应用启用了 Android edge-to-edge，且 React Native 自带 `SafeAreaView` 在 Android 上不能可靠为状态栏和开孔区域提供顶部避让。
- 已在根安全区容器中按 Android `StatusBar.currentHeight` 增加顶部 padding，主页、克隆内容页和结果页共用该外层容器，因此都会避开顶部系统区域。
- 已将 Expo 状态栏组件改为显式别名，避免与 React Native 原生状态栏 API 混用时命名冲突。
- 已保持原有主页入口、源照片选择、目标照片选择和底部“设置克隆”按钮流程不变。
- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 Android debug 构建 `gradlew.bat assembleDebug`，构建进程退出码为 0；构建输出包含 Expo 的 `NODE_ENV` 提示，但未导致构建失败。
- 剩余缺口：尚未在带刘海或前摄开孔的真实设备上进行视觉截图验收，最终仍需在目标设备确认标题没有被摄像头遮挡。

### 收窄顶部安全区视觉间距

- 用户反馈上一版顶部安全区过大。
- 已确认原因是根容器新增 Android 状态栏高度后，主页标题仍保留原来的较大顶部页面内边距，导致安全区和页面留白叠加。
- 已保留 Android 系统区域避让，但将主页标题顶部页面内边距从 28 调整为 10，将克隆内容页和结果页导航顶部页面内边距从 22 调整为 10。
- 已保持标题、说明文字、按钮、选择照片流程和底部操作栏不变。
- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 Android debug 构建 `gradlew.bat assembleDebug`，构建成功；输出仍包含 Gradle 弃用提示和 Expo `NODE_ENV` 提示，但未导致构建失败。

### 检查当前前端页面组织状态

- 用户询问当前是否只写了一个页面、所有内容是否堆在一个页面里。
- 已检查源码结构，当前 React Native 前端入口主要集中在 `App.tsx`。
- 当前用户可见流程不是单一界面，而是通过 `screen` 状态在首页、克隆内容页和结果页之间切换。
- 当前没有独立的 `screens` 路由目录，也没有引入 React Navigation 或 Expo Router。
- `HomeScreen`、`CloneOptionsScreen`、`ResultScreen`、弹窗、选择入口面板、照片面板、元数据项和样式都定义在 `App.tsx` 中。
- 结论：用户体验上已有三步页面流程；代码组织上确实仍是单文件集中实现，后续适合拆分页面组件、通用组件和样式模块。

### 拆分整页页面并注册导航

- 用户要求所有视觉上是一个整页的页面都拆成独立页面文件并注册导航。
- 已新增 React Navigation 依赖，使用 `@react-navigation/native` 和 `@react-navigation/native-stack` 注册页面栈。
- 已新增 `src/navigation/types.ts`，定义 `Home`、`CloneOptions`、`Result` 三个整页页面的导航类型。
- 已将首页拆分到 `src/screens/HomeScreen.tsx`，保留源照片选择、目标照片选择、元数据预览和底部“设置克隆”入口。
- 已将克隆内容页拆分到 `src/screens/CloneOptionsScreen.tsx`，保留分组元数据勾选和底部“开始克隆”入口。
- 已将结果页拆分到 `src/screens/ResultScreen.tsx`，保留成功、部分成功和失败结果展示，以及“返回”和“回到首页”入口。
- 已将照片面板、目标照片面板、元数据预览、元数据选项、应用内弹窗和选择入口面板拆入 `src/components`。
- 已将样式集中到 `src/styles/appStyles.ts`，将错误文案归类和元数据辅助函数拆入 `src/utils`。
- `App.tsx` 现在负责全局状态、选择照片、读取元数据、执行克隆、弹窗状态和导航注册，不再直接承载整页 UI 组件实现。

### 验证页面导航拆分

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 首次执行 `git status --short` 被 Git dubious ownership 安全检查拦截，原因仍是仓库所有者和当前运行用户不一致；该问题不影响本轮类型检查和构建验证。
- 首次执行 Android debug 构建时，Gradle wrapper 缓存锁文件访问被沙箱拒绝。
- 按授权规则提权后重新执行 `gradlew.bat -p android assembleDebug`，Android debug 构建成功。
- 构建输出确认新增原生依赖 `react-native-screens` 和 `react-native-safe-area-context` 参与 Android debug 构建。
- 构建输出仍包含 Gradle 弃用提示、Expo `NODE_ENV` 提示和第三方依赖弃用警告，但未导致构建失败。

### 调整主页为功能入口

- 用户指出克隆功能不应直接放在开屏，即使当前只有一个克隆功能，也应在主页做成功能入口。
- 用户要求新增“更多”入口，为后续版本信息、隐私政策和权限设置等内容预留位置。
- 已新增 `MainHomeScreen` 作为真正开屏首页，显示“元数据克隆”和“更多”两个入口。
- 已将原照片选择首页调整为 `CloneHome` 路由下的克隆功能内部页面，点击“元数据克隆”后进入。
- 已新增 `MoreScreen`，当前展示版本信息、隐私说明和权限设置预留说明。
- 已将导航类型扩展为 `Home`、`CloneHome`、`CloneOptions`、`Result` 和 `More`。
- 已保持克隆结果页“回到首页”按钮返回真正首页，使“首页”对应开屏功能入口。
- 已同步 `README.md`，记录开屏功能入口和“更多”入口。
- 已对本轮修改文件执行 CRLF 行尾统一。

### 验证主页入口调整

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 首次执行 Android debug 构建时，Gradle wrapper 缓存锁文件访问被沙箱拒绝。
- 按授权规则提权后重新执行 `gradlew.bat assembleDebug`，Android debug 构建成功。
- 调整结果页“回到首页”目标后，已再次执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 调整结果页“回到首页”目标后，已再次执行 `gradlew.bat assembleDebug`，Android debug 构建成功。
- 构建输出仍包含 Gradle 弃用提示和 Expo `NODE_ENV` 提示，但未导致构建失败。
- 剩余缺口：尚未在真机 debug 包中手动点击验证开屏“元数据克隆”入口、“更多”入口、克隆流程返回和结果页返回路径。

### 简化主页入口卡片文字

- 用户指出主页入口已经有标题，右侧蓝色“进入”和“查看”文字可以拿掉。
- 已移除 `MainHomeScreen` 中两个入口卡片右侧的蓝色尾部文字。
- 已删除不再使用的 `featureArrow` 样式。
- 入口卡片仍保持整卡可点击，标题和说明文字不变。
- 已对本轮修改文件执行 CRLF 行尾统一。

### 验证主页入口文字简化

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。

### 替换主页入口文字图标

- 用户指出主页入口左侧图标内部仍是文字，希望换成示意图标。
- 已将“元数据克隆”入口左侧从 `EX` 文字改为 React Native View 绘制的叠放照片示意图。
- 已将“更多”入口左侧从文本省略号改为三个圆点组成的示意图标。
- 本轮未新增图标库或其他依赖，避免为两个入口扩大依赖范围。
- 已对本轮修改文件执行 CRLF 行尾统一。

### 验证主页入口图标替换

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。

### 调整克隆入口为复制图标

- 用户指出克隆入口需要更像克隆或 copy 的图标。
- 已将“元数据克隆”入口左侧图标从叠放照片示意图改为双层重叠方框 copy 图标。
- “更多”入口三点图标保持不变。
- 已对本轮修改文件执行 CRLF 行尾统一。

### 验证克隆入口复制图标调整

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。

### 移除已删除的 Android 自适应图标引用

- 用户替换了 `assets/icon.png` 和 `assets/splash-icon.png`，并删除了 `assets/android-icon-background.png`、`assets/android-icon-foreground.png` 和 `assets/android-icon-monochrome.png`。
- 已从 `app.json` 移除 `android.adaptiveIcon` 配置，避免 Expo 配置继续引用已删除的 Android 自适应图标文件。
- 当前 Expo 配置继续保留通用应用图标 `assets/icon.png` 和启动图标 `assets/splash-icon.png`。

### 强制重建 Android 图标资源

- 用户要求强制重新构建，避免代码未变化时误复用旧安装包导致图标替换失败。
- 已执行 `npx expo prebuild --platform android --no-install`，将新的 `assets/icon.png` 和 `assets/splash-icon.png` 同步到 Android 原生资源。
- Expo prebuild 重新生成了启动图资源和 launcher 图标资源，并移除了原先的 round/adaptive launcher 资源引用。
- 首次执行 `gradlew.bat clean assembleDebug` 因 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行成功。
- 已执行 Android debug 强制清理构建 `gradlew.bat clean assembleDebug`，构建输出显示 `:app:clean` 和 `:app:assembleDebug` 均已执行，debug APK 已重新生成。
- 已确认重新生成的 debug APK 位于 `android/app/build/outputs/apk/debug/app-debug.apk`。
- 已搜索 `app.json`、`android` 和 `assets`，未发现 `android-icon-*`、`adaptiveIcon`、`foregroundImage`、`backgroundImage`、`monochromeImage` 或 `ic_launcher_round` 残留引用。

### 确认 release 签名边界

- 用户询问 release 是否应使用独立私钥，而不是继续使用 debug 签名。
- 已检查 `android/app/build.gradle`，当前 `release` buildType 仍配置为 `signingConfig signingConfigs.debug`，属于 React Native/Expo 初始模板中的临时开发配置。
- 已确认长期分发或正式验收 APK 应使用独立 release keystore 签名；debug keystore 只适合本机开发、调试和临时安装。
- 风险边界：release keystore 文件、密码、alias 和 key password 属于私有签名材料，不应写入仓库、开发日志、README 或提交信息。
- 剩余缺口：尚未生成 release keystore，也尚未把 Gradle release 签名改为从本机未入库配置或环境变量读取。

### 实现 release 独立签名配置

- 已将 `android/app/build.gradle` 的 release buildType 从 debug 签名切换为独立 `release` signingConfig。
- 已新增 Gradle 本机签名配置读取逻辑，从 `android/keystore.properties` 读取 release keystore 路径、密码、alias 和 key password。
- 已新增 release 任务检查：执行 release 相关 Gradle 任务时，如果本机签名配置缺失，会明确失败并提示创建 `android/keystore.properties`。
- 已确认 debug buildType 仍使用 `debug.keystore`，不改变 Expo Dev Client 调试包签名方式。
- 已新增 `android/keystore.properties.example` 作为非密钥模板，模板不包含真实密码。
- 已更新 `.gitignore`，忽略 `android/keystore.properties`、`.jks` 和 `.keystore`，防止真实签名材料入库。
- 已在本机生成新的 release keystore 和对应本机签名配置文件；真实密码、密钥文件内容和证书指纹未写入仓库、日志或文档。
- 已更新 `README.md`，说明 release 构建需要本机签名配置，并提醒备份 release key。

### 验证 release 独立签名配置

- 首次执行 `gradlew.bat assembleDebug` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行。
- 提权执行 `gradlew.bat assembleDebug` 后首次失败，原因是本轮 CRLF 统一操作把 `android/app/build.gradle` 写成带 BOM 的 UTF-8，Gradle 无法解析文件开头字符。
- 已将 `android/app/build.gradle` 和本机 `android/keystore.properties` 改回 UTF-8 无 BOM，并保持 CRLF 行尾。
- 已重新执行 `gradlew.bat assembleDebug`，Android debug 构建成功，确认日常调试包仍可构建。
- 首次执行 `gradlew.bat assembleRelease` 因工具超时未返回结果，且当时未生成 release APK。
- 已使用更长超时重新执行 `gradlew.bat assembleRelease --console=plain`，Android release 构建成功，构建输出包含 `:app:validateSigningRelease` 和 `:app:assembleRelease`。
- 已使用 Android SDK `apksigner` 校验 `android/app/build/outputs/apk/release/app-release.apk`，签名验证通过。
- 已执行 Git 状态检查，确认真实 `android/keystore.properties` 和 `android/app/exif-helper-release.jks` 处于 ignored 状态，未进入待提交文件列表。
- 已执行 `git diff --check` 检查本轮文本改动，未报告空白错误。

### 区分 debug 和 release 应用身份

- 用户询问是否可以让 release 和 debug 包名不同，以便同一设备同时安装 release 包和 debug 包，避免因签名不同而反复卸载安装。
- 已将 `android/app/build.gradle` 的 debug buildType 增加 `applicationIdSuffix ".debug"`。
- 调整后 release 应用 ID 保持 `com.local.exifhelper`，debug 应用 ID 变为 `com.local.exifhelper.debug`。
- 已新增 debug 专用字符串资源 `android/app/src/debug/res/values/strings.xml`，将 debug 包桌面名称改为“EXIF助手 Debug”，release 名称继续使用“EXIF助手”。
- 已更新 README 中 debug 启动命令，改为显式启动 `com.local.exifhelper.debug/com.local.exifhelper.MainActivity`，避免 debug 和 release 同时安装时 deep link 解析到错误应用。
- 已将 debug/release 并存规则同步到 `AGENTS.md` 项目补充规则。

### 验证 debug 和 release 应用身份区分

- 已做静态检查，确认 `defaultConfig.applicationId` 仍为 `com.local.exifhelper`，debug buildType 包含 `applicationIdSuffix ".debug"`。
- 已检查 debug 资源覆盖文件，确认 debug 包应用名配置为“EXIF助手 Debug”。
- 已执行 `git diff --check` 检查本轮文本改动，未报告空白错误。
- 由于本轮执行 `gradlew.bat assembleDebug --console=plain` 的提权请求被审批系统拦截，未能完成实际 APK 重建验证。
- 剩余缺口：需要在可执行 Gradle 的环境中重新运行 `gradlew.bat assembleDebug --console=plain` 和 `gradlew.bat assembleRelease --console=plain`，再在设备上确认两个图标可同时安装和启动。

### 构建并尝试安装最新 debug 和 release 包

- 用户要求把最新 release 和 debug 都安装到连接设备。
- 已通过 `adb devices` 检测到一台已连接设备。
- 首次普通执行 `gradlew.bat assembleDebug --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行成功。
- 已执行 `gradlew.bat assembleRelease --console=plain`，release 构建成功，构建输出包含 `:app:validateSigningRelease` 和 `:app:assembleRelease`。
- 已尝试通过 `adb install -r` 分别安装 debug 和 release APK；两个安装命令均超时。
- 已改用 `adb push`，成功将 debug APK 推送到设备 `/data/local/tmp/exif-helper-debug.apk`，将 release APK 推送到设备 `/data/local/tmp/exif-helper-release.apk`。
- 已尝试通过设备端 `pm install -r /data/local/tmp/exif-helper-debug.apk` 安装 debug APK，但命令超时且包列表未出现 `com.local.exifhelper.debug`。
- 已检查设备状态，ADB shell 正常、设备剩余空间充足、APK 已在设备临时目录中。
- 已通过 logcat 和 window/activity dumpsys 确认阻塞原因：设备处于锁屏状态，系统安装器 `com.android.packageinstaller/.InstallStaging` 正在等待前台确认，`mDreamingLockscreen=true` 且输入受限。
- 剩余缺口：需要用户手动解锁设备，并在系统安装确认界面允许安装；之后再继续完成 debug 和 release 的安装确认。

### 完成最新 debug 和 release 包并存安装

- 用户解锁设备后要求重新开始安装。
- 已确认设备在线，`mDreamingLockscreen=false` 且输入不再受限。
- 已确认 `/data/local/tmp/exif-helper-debug.apk` 和 `/data/local/tmp/exif-helper-release.apk` 仍存在。
- 已执行 `pm install -r /data/local/tmp/exif-helper-debug.apk`，设备返回 `Success`。
- 已执行 `pm install -r /data/local/tmp/exif-helper-release.apk`，设备返回 `Success`。
- 已通过 `pm list packages` 确认设备同时存在 `com.local.exifhelper.debug` 和 `com.local.exifhelper`。
- 已通过 `cmd package resolve-activity --brief` 确认 release 启动入口为 `com.local.exifhelper/.MainActivity`，debug 启动入口为 `com.local.exifhelper.debug/com.local.exifhelper.MainActivity`。
- 已通过 `dumpsys package` 确认两个包的 `versionName` 均为 `1.0.0`，且安装/更新时间为本轮安装时间。

### 同步 Android 发布归档和签名规则

- 用户要求本项目沿用另一个 Android 项目的发布归档和签名规则，但先检查本项目路径和文件名是否一致。
- 已检查当前项目，Release 签名配置读取 `android/keystore.properties`，Debug 签名文件为 `android/app/debug.keystore`，Release 构建使用 `signingConfigs.release`。
- 已确认公开忽略规则包含 `*.jks`、`*.keystore`、`android/keystore.properties` 和 `android/app/debug.keystore`，私有签名材料不会进入 Git 追踪。
- 已发现本项目原有私有 Release 签名文件名为 `android/app/exif-helper-release.jks`，与用户希望沿用的 `android/app/release.keystore` 命名不一致。
- 已将本机私有 Release 签名文件改名为 `android/app/release.keystore`，并更新本机私有 `android/keystore.properties` 的 store file 路径；未记录或输出任何密码、alias 或 key password。
- 已更新 `android/keystore.properties.example`，使非密示例路径指向 `app/release.keystore`。
- 已将 Android 发布/分发归档规则同步到 `AGENTS.md`：普通构建不要求归档；发布/分发归档放入 `dist/`；命名格式为 `<软件名>-v<语义版本>-android-<yyyyMMdd>.apk`；归档来源必须是 Release APK；已归档同名产物禁止覆盖，除非先获得用户明确同意。
- 已更新 `README.md` 的 Release 签名文件说明和发布归档命名说明。
- 剩余缺口：当前项目说明中 v0.1 范围和 Android `versionName` / package version `1.0.0` 存在版本语义差异，正式归档前需要确认实际发布版本号。

### 确认 1.0.0 为实际软件版本号

- 用户确认本项目实际版本为 `1.0.0`，发布归档版本号以软件版本号为准。
- 已确认当前 `app.json`、`package.json` 和 Android `versionName` 均为 `1.0.0`。
- 已将 `AGENTS.md` 当前项目规则中的初版范围从 `v0.1` 更新为 `1.0.0`，避免后续按旧范围描述归档或说明。
- 已在 `AGENTS.md` 和 `README.md` 中明确发布/分发归档命名的 `<语义版本>` 使用软件版本号；当前归档版本应使用 `1.0.0`。

### 构建并归档 Android 1.0.0 发布包

- 用户要求构建并归档当前 Android 安装包。
- 已按归档规则检查 `dist/EXIF助手-v1.0.0-android-20260511.apk` 不存在，避免覆盖已归档产物。
- 首次普通执行 `gradlew.bat assembleRelease --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行成功。
- Release 构建输出显示 `:app:validateSigningRelease`、`:app:packageRelease` 和 `:app:assembleRelease` 完成，构建结果为 `BUILD SUCCESSFUL`。
- 已从 Release APK 输出 `android/app/build/outputs/apk/release/app-release.apk` 复制归档到 `dist/EXIF助手-v1.0.0-android-20260511.apk`。
- 已核对 Release 源 APK 和归档 APK 文件大小均为 62266681 字节，确认复制后的归档大小一致。
- 已确认 `dist/` 被 Git 忽略，归档产物不会进入开源仓库追踪。

### 检查 1.0.0 发布准备状态

- 用户询问当前是否可以发布，并要求从各方面检查。
- 已确认 `dist/EXIF助手-v1.0.0-android-20260511.apk` 与 Release 输出 `android/app/build/outputs/apk/release/app-release.apk` 文件大小一致，均为 62266681 字节。
- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已通过 `apksigner verify --verbose --print-certs` 检查归档 APK，签名验证通过，APK 使用 v2 签名方案且签名者数量为 1。
- 已通过 `aapt dump badging` 检查 Release 源 APK，包名为 `com.local.exifhelper`，`versionCode=1`，`versionName=1.0.0`，`minSdk=24`，`targetSdk=35`，应用标签为“EXIF助手”。
- 已通过 `aapt dump permissions` 和合并后的 Release Manifest 检查权限，确认 Release 包不包含 `android.permission.INTERNET`。
- 已发现 Release 包仍声明 `android.permission.CAMERA`，但当前产品入口未提供拍照选择能力；该权限来自图片选择相关依赖的 Manifest 合并，发布前建议移除或明确保留原因。
- 已检查归档 APK 的 SHA-256 哈希，当前归档哈希为 `A3BBD5C267FB0DD5C9F55E750228A2255676C610DAE87DE5BF6C86570195D25B`。
- 已尝试通过 `adb install -r` 安装归档 APK 到已连接设备，但命令超时；设备处于锁屏状态且系统安装器 `InstallStaging` 正在等待前台确认，因此归档 APK 的最终安装验收未完成。
- 已通过设备包信息确认设备当前已安装 `com.local.exifhelper` 和 `com.local.exifhelper.debug`，其中 release 包版本为 `1.0.0`，但本轮归档 APK 未能完成重新安装确认。
- 已确认私有签名文件、私有签名配置和 `dist/` 均被 Git 忽略。
- 已确认当前工作区仍有未提交的文档和规则变更：`AGENTS.md`、`README.md`、`android/keystore.properties.example`、`develop_log.md`。
- 发布结论：构建、签名、版本和归档链路可用；严格发布前仍需处理或确认 `CAMERA` 权限、完成归档 APK 设备安装验收，并提交或明确保留当前文档规则改动。

### 确认归档 APK 安装验收

- 用户反馈已自行验证归档包安装正常。
- 已将此前“归档 APK 设备安装验收未完成”的发布阻塞项视为关闭。
- 当前发布前剩余事项：确认是否移除 Release 包中的 `CAMERA` 权限，以及提交或明确保留当前发布规则、签名路径、归档说明和开发日志改动。

### 移除 Release 包相机权限

- 用户确认移除 Release 包中的 `CAMERA` 权限。
- 已在 `android/app/src/release/AndroidManifest.xml` 中新增 `android.permission.CAMERA` 的 `tools:node="remove"` 规则，只作用于 Release 构建。
- 已在 `AGENTS.md` 中记录项目规则：除非后续明确新增直接拍照功能，否则 Release 包不得恢复 `CAMERA` 权限。
- 已在 `README.md` 隐私说明中补充 Release 构建不包含相机权限。
- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 首次普通执行 `gradlew.bat assembleRelease --console=plain` 仍因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行成功。
- 已通过 `aapt dump permissions` 检查新的 Release 输出 APK，权限列表不再包含 `android.permission.CAMERA`，也不包含 `android.permission.INTERNET`。
- 已通过 `apksigner verify --verbose` 检查新的 Release 输出 APK，签名验证通过，APK 使用 v2 签名方案且签名者数量为 1。
- 新的 Release 输出 APK 为 `android/app/build/outputs/apk/release/app-release.apk`，大小为 62266653 字节，SHA-256 为 `1E55E80177D3E3B1DB85805CC96DB1EDE12D73E53C6747E1AA4D4D2EA71CEB2F`。
- 当前已存在的归档 `dist/EXIF助手-v1.0.0-android-20260511.apk` 仍是移除 `CAMERA` 权限前的旧归档；根据禁止覆盖已归档同名产物的规则，尚未覆盖该归档。

### 覆盖 1.0.0 Android 归档包

- 用户明确要求覆盖已存在的同名归档。
- 已用移除 `CAMERA` 权限后的新 Release 输出 APK 覆盖 `dist/EXIF助手-v1.0.0-android-20260511.apk`。
- 覆盖后的归档大小为 62266653 字节。
- 已核对 Release 源 APK 和覆盖后归档 APK 的 SHA-256 均为 `1E55E80177D3E3B1DB85805CC96DB1EDE12D73E53C6747E1AA4D4D2EA71CEB2F`。
- 已通过 `apksigner verify --verbose` 检查覆盖后归档 APK，签名验证通过，APK 使用 v2 签名方案且签名者数量为 1。
- 已通过临时 ASCII 路径执行 `aapt dump permissions` 检查覆盖后归档 APK，确认权限列表不包含 `android.permission.CAMERA` 和 `android.permission.INTERNET`。
- 已确认 `dist/` 仍被 Git 忽略，覆盖后的归档产物不会进入开源仓库追踪。

### 安装最新 1.0.0 发布包到设备

- 用户要求将最新发布包安装到设备，并检查发布前剩余事项。
- 已确认已连接设备在线。
- 已确认当前归档 `dist/EXIF助手-v1.0.0-android-20260511.apk` 大小为 62266653 字节，SHA-256 为 `1E55E80177D3E3B1DB85805CC96DB1EDE12D73E53C6747E1AA4D4D2EA71CEB2F`。
- 已将归档 APK 推送到设备临时路径 `/data/local/tmp/exif-helper-release-1.0.0.apk`，设备端文件大小为 62266653 字节。
- 已执行 `pm install -r /data/local/tmp/exif-helper-release-1.0.0.apk`，设备返回 `Success`。
- 已通过 `dumpsys package com.local.exifhelper` 确认设备上 release 包 `versionName=1.0.0`，`versionCode=1`，`lastUpdateTime` 为本轮安装时间。
- 已确认设备上 release 包权限清单不包含 `android.permission.CAMERA` 和 `android.permission.INTERNET`。
- 已通过 `cmd package resolve-activity --brief com.local.exifhelper` 确认 release 启动入口为 `com.local.exifhelper/.MainActivity`。
- 已通过 `pm list packages` 确认设备仍同时存在 `com.local.exifhelper` 和 `com.local.exifhelper.debug`。

### 明确 Android 归档文件名规则

- 已将 Android 发布/分发归档命名规则从 `<软件名>-v<语义版本>-android-<yyyyMMdd>.apk` 进一步明确为 `EXIF_Helper-v<语义版本>-android-<yyyyMMdd>.apk`。
- 该规则变更只影响后续发布/分发归档文件名说明，不改变当前 Release 构建、签名、权限或安装包内容。
- 本轮验证方式为检查 `AGENTS.md` 与 `develop_log.md` 的文档 diff，确认改动范围仅为项目规则和开发日志。

## 2026-05-23

### 分析顶部安全边距随机失效原因

- 用户反馈应用有时打开后顶部安全边距失效，文字直接顶到屏幕最顶部，并要求先分析原因。
- 已检查 `App.tsx`、`src/styles/appStyles.ts`、页面组件、`app.json`、Android `styles.xml` 和 `gradle.properties` 中与安全区、状态栏、edge-to-edge 相关的配置。
- 当前应用启用了 Android `edgeToEdgeEnabled`，并在 JS 中把 Expo 状态栏设为 `translucent`，窗口内容允许绘制到状态栏区域。
- 当前根容器使用 React Native 自带 `SafeAreaView`，再通过 `StatusBar.currentHeight || 0` 手动增加 Android 顶部 padding；该值不是实时 window inset，初始化或窗口恢复时可能短暂或偶发为 `0`。
- 所有页面顶部标题都依赖 `App.tsx` 最外层这一次 padding，页面自己的 `header` 和 `navigationHeader` 没有读取安全区 inset 的兜底，因此根容器 padding 一旦为 `0`，主页标题或返回栏标题就会贴到屏幕顶部。
- 初步结论：随机异常的主要原因是 Android edge-to-edge/透明状态栏环境下使用 `StatusBar.currentHeight` 作为安全区来源不可靠；应改为 `react-native-safe-area-context` 的 `SafeAreaProvider` 和 `SafeAreaView`/`useSafeAreaInsets` 读取系统实际 inset。
- 本轮只做原因分析和日志记录，尚未修改应用安全区实现，也未运行构建验证。

### 修复顶部安全边距随机失效

- 已将 `App.tsx` 根容器从 React Native 自带 `SafeAreaView` 切换为 `react-native-safe-area-context` 的 `SafeAreaProvider` 和 `SafeAreaView`。
- 新根安全区容器使用系统实际 inset 处理 `top`、`left` 和 `right` 边缘，避免继续依赖 Android `StatusBar.currentHeight` 的一次性高度值。
- 已从 `src/styles/appStyles.ts` 删除 `androidSafeArea` 和 `StatusBar.currentHeight` 引用，保留统一背景色和页面内部既有间距。
- 本轮未调整主页面、克隆页面、结果页和更多页的业务流程、按钮、选择器、元数据读取或写入逻辑。

### 验证顶部安全边距修复

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 首次执行 Android debug 构建时因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；提权后首次执行因 120 秒超时未返回构建结果。
- 已确认超时后未生成新的 debug APK，并观察到剩余 Java 进程处于空闲状态，没有持续构建输出。
- 已使用更长超时重新执行 `gradlew.bat assembleDebug --console=plain`，Android debug 构建成功，输出包含 `:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 构建输出仍包含 Expo `NODE_ENV` 提示和 Gradle 弃用提示，但未导致构建失败。
- 剩余缺口：尚未在真实设备上反复冷启动、从系统选择器返回和锁屏恢复后做视觉验收；最终仍需在目标 Android 设备确认顶部标题始终避开状态栏和前摄区域。

### 分析不同目标照片元数据克隆不一致

- 用户反馈同一张源照片克隆到不同目标照片时，有的目标照片能完整克隆，有的目标照片只能克隆部分信息。
- 已检查原生写入链路，当前流程是把目标 URI 复制到缓存文件，使用 AndroidX `ExifInterface.setAttribute()` 写入勾选标签，`saveAttributes()` 后重新读取逐项校验，再把副本保存到 `Pictures/EXIF助手`。
- 已确认部分成功的直接原因通常不是源照片差异，而是目标照片自身格式、编码、元数据段结构或 AndroidX ExifInterface 对特定标签的保存能力不同；PNG 目标和部分经过编辑、导出、转发的目标图更容易出现标签被规范化、拒写或保存后读不回。
- 已发现一个实现缺口：目标格式识别此前会在无法从 URI 或 MIME 明确判断时默认当成 JPG，并且会在读文件头前接受该默认值，可能让 HEIC、WebP 或未知内容的目标图进入 JPG 写入流程，造成用户看到不稳定的部分写入结果。

### 修复未知目标格式误判为 JPG

- 已将目标照片写入前的格式识别改为只根据真实文件头确认 JPG/JPEG 或 PNG；无法确认文件头时返回“不支持写入该目标图片格式”，不再默认按 JPG 处理。
- 已保留源照片读取的宽松策略：源照片复制到缓存时仍可使用 URI、MIME 或 `.bin` 临时扩展名交给 AndroidX ExifInterface 尝试读取，不把源照片限制为 JPG/JPEG/PNG。
- 已删除不再使用的 `SUPPORTED_EXTENSIONS` 常量，避免后续误读为仍按扩展名判断目标可写格式。
- 已将结果页部分成功文案从“未通过校验”调整为“未写入或未保留”，并把原生 warning 调整为“目标图片只接受了部分元数据”，让用户理解这是目标图片接受能力差异。
- 已更新 `README.md` 当前限制，说明目标格式检测需要确认 JPG/JPEG 或 PNG 文件头，未知格式会被拒绝而不是按 JPG 处理。

### 验证目标格式识别修复

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `git diff --check`，未报告空白错误。
- 首次执行 `gradlew.bat assembleDebug --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行。
- 提权执行 `gradlew.bat assembleDebug --console=plain` 后 Android debug 构建成功，输出包含 `:app:compileDebugKotlin`、`:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 构建输出仍包含 `TAG_ISO_SPEED_RATINGS` 弃用警告、Expo `NODE_ENV` 提示和 Gradle 弃用提示，但未导致构建失败。
- 剩余缺口：尚未在真实设备上用用户反馈的同一源照片和多张目标照片重新执行克隆对比；仍需用这些样张确认哪些目标图片是格式不支持，哪些是 AndroidX ExifInterface 对特定标签拒写或保存后不保留。

### 修正成功判定只校验临时文件的问题

- 用户纠正实际现象：结果页没有异常并提示成功，但最终保存图片实际没有完整克隆；因此问题不是结果页已经报告部分成功，而是成功判定不可信。
- 已确认此前原生流程在 `workingFile` 临时缓存文件上执行写入后校验，然后才通过 MediaStore 保存到 `Pictures/EXIF助手`；如果 MediaStore 最终输出副本在保存或重新读取时丢失部分 EXIF，结果页仍会显示成功。
- 已将校验点改到最终输出 URI：`saveToPictures()` 返回后，再把输出 URI 复制回缓存并用 AndroidX ExifInterface 重新读取，按最终副本中的标签值计算 `failedTags`。
- 调整后只有最终输出副本完整保留勾选标签时才显示成功；如果最终副本缺失或不匹配部分标签，结果页会显示“部分”并列出“未写入或未保留”的标签。

### 验证最终输出副本校验修复

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `git diff --check`，未报告空白错误。
- 首次执行 `gradlew.bat assembleDebug --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行。
- 提权执行 `gradlew.bat assembleDebug --console=plain` 后 Android debug 构建成功，输出包含 `:app:compileDebugKotlin`、`:app:packageDebug`、`:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 构建输出仍包含 `TAG_ISO_SPEED_RATINGS` 弃用警告、Expo `NODE_ENV` 提示和 Gradle 弃用提示，但未导致构建失败。
- 剩余缺口：尚未在真实设备上安装最新 debug 包，并用用户反馈的样张验证结果页是否从误报“成功”改为准确显示“部分”。

### 分析 JPG 源图克隆到 PNG 目标仍不可见

- 用户继续反馈 PNG 目标仍有问题，当前明确样例是 JPG 源照片的元数据克隆不进 PNG 目标照片；尚不确定是否所有 PNG 都受影响。
- 已检查本地 AndroidX ExifInterface 1.4.1 类结构，确认该版本包含 PNG `eXIf` chunk 读写路径，包括 `savePngAttributes()`、`writePngExifChunk()` 和 `writePngXmpItxtChunk()`。
- 已识别新的风险边界：应用此前对 PNG 的最终校验仍依赖 AndroidX ExifInterface 自己读回；即使 AndroidX 能读到 PNG `eXIf`，系统相册、MediaStore 或部分 EXIF 查看工具也可能不显示 PNG eXIf，因此用户可见效果仍可能像“没有克隆进去”。
- 本轮判断：需要增强 PNG 输出兼容性，不能只依赖 PNG eXIf。

### 增强 PNG 元数据兼容写入

- 已在 PNG 目标写入时继续保留 AndroidX ExifInterface 的原有 EXIF 写入路径。
- 已为 PNG 目标额外生成 XMP 数据，并通过 `ExifInterface.TAG_XMP` 写入 PNG iTXt 元数据块，覆盖拍摄时间、修改时间、厂商、型号、软件、镜头、焦距、曝光、光圈、ISO、曝光补偿、测光、闪光灯、白平衡、GPS 经纬度和海拔等可从源标签映射出的字段。
- 已在保存输出图片到 MediaStore 时根据源照片 `DateTimeOriginal`、`DateTimeDigitized` 或 `DateTime` 写入 `MediaStore.Images.Media.DATE_TAKEN`，提升系统相册按拍摄时间显示 PNG 输出的机会。
- 已保留最终输出 URI 的 EXIF 读回校验；PNG 的 XMP 和 MediaStore 写入作为兼容增强，不改变用户勾选标签的主校验逻辑。
- 已更新 `README.md`，说明 PNG 输出会尽量写入 EXIF、XMP 和 MediaStore 日期字段，同时明确 PNG 元数据识别仍依赖查看器兼容性。

### 验证 PNG 兼容写入增强

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `git diff --check`，未报告空白错误。
- 首次执行 `gradlew.bat assembleDebug --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行。
- 提权执行 `gradlew.bat assembleDebug --console=plain` 后 Android debug 构建成功，输出包含 `:app:compileDebugKotlin`、`:app:packageDebug`、`:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 构建输出仍包含 `TAG_ISO_SPEED_RATINGS` 弃用警告、Expo `NODE_ENV` 提示和 Gradle 弃用提示，但未导致构建失败。
- 已删除本轮用于查看 AndroidX 类结构的临时解包目录，避免把临时分析文件留在工作区。
- 剩余缺口：尚未在真实设备上用用户反馈的 JPG 源图和 PNG 目标图验证系统相册、应用读回和外部 EXIF 查看工具分别能看到哪些元数据。

### 修正 PNG 结果误报完全成功

- 用户反馈安装 PNG 兼容增强版后，JPG 源图克隆到 PNG 目标仍显示成功，但实际验收仍认为克隆失败。
- 已从设备拉取最新输出 PNG 到临时目录检查文件结构；该 PNG 文件包含 1 个 `eXIf` 块和 1 个 `iTXt` 块，且二者位于 `IDAT` 图像数据前，说明应用确实写入了 PNG eXIf/XMP，但用户验收路径仍可能不识别这些 PNG 元数据。
- 已确认问题核心变为结果语义：PNG 输出即使 AndroidX 可读回，也不能对用户承诺“完全成功”。
- 已在结果模型中新增 `partial` 标记，使 PNG 输出在有兼容性警告但没有具体 `failedTags` 时也显示“部分”。
- 已调整结果页统计：顶部“成功”只统计完全成功，“部分”单独统计 PNG 兼容性受限或存在未保留标签的结果。
- 已将 PNG 输出 warning 设置为“PNG 元数据已写入 eXIf/XMP，但部分相册或工具可能无法识别”，避免继续误导用户认为 PNG 已达到 JPEG 同等可见性。
- 已删除本轮从设备拉取输出 PNG 的临时检查目录，未保留用户样张副本。

### 验证并安装 PNG 部分结果标记

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `git diff --check`，未报告空白错误。
- 首次执行 `gradlew.bat assembleDebug --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行。
- 提权执行 `gradlew.bat assembleDebug --console=plain` 后 Android debug 构建成功，输出包含 `:app:compileDebugKotlin`、`:app:packageDebug`、`:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 已执行 `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`，设备返回 `Success`。
- 已通过 `dumpsys package com.local.exifhelper.debug` 确认设备上 debug 包 `versionName=1.0.0`，`lastUpdateTime` 为本轮安装时间。
- 剩余缺口：PNG 目标仍需要用户用同一 JPG 源图和 PNG 目标图复测；本轮目标是停止误报完全成功，并明确 PNG 元数据可见性受查看器兼容性限制。

### 实现 PNG 原生兼容 EXIF Profile 写入

- 用户明确要求从根本解决 JPG 源图元数据克隆到 PNG 目标的问题，而不是只把结果标成“部分”。
- 已在 AndroidX 写入 PNG eXIf 和 XMP 后，新增应用自有 PNG 块重写逻辑，直接解析 PNG chunk 并在 `IHDR` 后写入兼容元数据块。
- 新增写入 `Raw profile type exif` 的 `tEXt` 块，内容为 ImageMagick/ExifTool 常见 raw EXIF profile 文本格式，使用 `Exif\0\0` 前缀加 PNG eXIf 中的 TIFF 数据转十六进制保存。
- 新增写入常见 PNG 文本字段，包括 `Creation Time`、`Software`、`Make`、`Model`、`LensModel`、GPS 纬度和经度文本字段，用于提高非 EXIF 型 PNG 查看器的基础信息可见性。
- 新增 PNG 兼容结构校验：最终输出副本必须同时存在标准 `eXIf`、XMP `iTXt` 和 `Raw profile type exif`，且勾选标签经 AndroidX 读回匹配，才显示完全成功；结构缺失时显示“部分”。
- 已更新 `README.md`，说明 PNG 现在写入标准 eXIf、XMP iTXt、ImageMagick/ExifTool raw EXIF profile 和 MediaStore 日期字段。

### 验证并安装 PNG 原生兼容写入

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `git diff --check`，未报告空白错误。
- 首次执行 `gradlew.bat assembleDebug --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行。
- 提权执行 `gradlew.bat assembleDebug --console=plain` 后 Android debug 构建成功，输出包含 `:app:compileDebugKotlin`、`:app:packageDebug`、`:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 首次执行 `adb install -r android/app/build/outputs/apk/debug/app-debug.apk` 返回失败但未给出具体安装原因；随后改用 `adb push` 将 APK 推送到设备临时路径。
- 执行设备端 `pm install` 时设备短暂变为 offline；已重启 ADB server，等待设备重新授权并恢复 online。
- 设备恢复 online 后，已执行 `adb shell pm install -r /data/local/tmp/exif-helper-debug.apk`，设备返回 `Success`。
- 已通过 `dumpsys package com.local.exifhelper.debug` 确认设备上 debug 包 `versionName=1.0.0`，`lastUpdateTime` 为本轮安装时间。
- 剩余缺口：需要用户用同一 JPG 源图和 PNG 目标图重新执行克隆，并用实际验收工具确认 `Raw profile type exif` 写入后是否可见。

### 安装最终输出副本校验修复到真机

- 用户反馈已连接真机，并询问如需安装新版则直接安装。
- 已确认连接设备在线，设备列表中存在一台 `device` 状态的 Android 设备。
- 已确认本轮 debug APK 输出存在，文件更新时间为本轮最终输出副本校验修复后的构建时间。
- 已执行 `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`，设备返回 `Success`。
- 已通过 `dumpsys package com.local.exifhelper.debug` 确认设备上的 debug 包 `versionName=1.0.0`，`lastUpdateTime` 为本轮安装时间。
- 已通过 `cmd package resolve-activity --brief com.local.exifhelper.debug` 确认 debug 启动入口为 `com.local.exifhelper.debug/com.local.exifhelper.MainActivity`。
- 剩余缺口：尚未由用户在真机上用反馈问题的源照片和目标照片执行克隆验证。

### 增补 PNG 压缩 Raw Profile 兼容写入

- 用户复测后反馈 JPG 源图克隆到 PNG 目标依旧没有成功。
- 已确认上一版 PNG 兼容写入只补写未压缩 `tEXt Raw profile type exif`，而部分 PNG 元数据工具和历史 ImageMagick/ExifTool 兼容路径更常见的是压缩 `zTXt` raw profile，并可能识别 `Raw profile type APP1`。
- 已将 PNG 兼容写入扩展为同时写入 `zTXt` 和 `tEXt` 两种 raw profile，并同时提供 `Raw profile type APP1` 与 `Raw profile type exif` 两个关键字。
- `APP1` raw profile 使用 `APP1` profile 名称，`exif` raw profile 使用 `exif` profile 名称；二者内容都保留 `Exif\0\0` 前缀加 PNG `eXIf` 中 TIFF 数据的十六进制 profile。
- 已调整 PNG 兼容结构校验，使最终输出副本存在 `zTXt` 或 `tEXt` raw profile 任一兼容块即可通过 raw profile 结构检查。
- 已更新 `README.md`，说明 PNG 输出现在写入标准 `eXIf`、XMP `iTXt`、压缩和未压缩 raw EXIF profile，以及 MediaStore 日期字段。
- 已清理本轮用于分析设备输出 PNG 的临时目录，未在工作区保留用户样张副本。

### 验证并安装 PNG 压缩 Raw Profile 写入

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `git diff --check`，未报告空白错误。
- 首次执行 `gradlew.bat assembleDebug --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行。
- 提权执行 `gradlew.bat assembleDebug --console=plain` 后 Android debug 构建成功，输出包含 `:app:compileDebugKotlin`、`:app:packageDebug`、`:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 构建输出仍包含 `TAG_ISO_SPEED_RATINGS` 弃用警告、Expo `NODE_ENV` 提示和 Gradle 弃用提示，但未导致构建失败。
- 已执行 `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`，设备返回 `Success`。
- 已通过 `dumpsys package com.local.exifhelper.debug` 确认设备上 debug 包 `versionName=1.0.0`，`lastUpdateTime` 为本轮安装时间。
- 已通过 `cmd package resolve-activity --brief com.local.exifhelper.debug` 确认 debug 启动入口为 `com.local.exifhelper.debug/com.local.exifhelper.MainActivity`。
- 剩余缺口：需要用户用同一 JPG 源图和 PNG 目标图重新执行克隆，并用实际验收工具确认压缩 `zTXt` 与 `APP1` raw profile 加入后是否可见。

### 复查 PNG 输出文件与系统媒体索引差异

- 用户复测后反馈 PNG 目标除时间外没有任何信息成功克隆进去。
- 已从设备拉取本轮最新 PNG 输出副本到临时目录进行二进制解析；该文件包含标准 `eXIf`、XMP `iTXt`、2 个压缩 `zTXt` raw profile、2 个未压缩 `tEXt` raw profile 和基础 PNG 文本字段。
- 已使用本机图片元数据解析库读取该 PNG，确认文件内部可读到相机厂商、相机型号、GPS 经纬度、拍摄时间、曝光时间、光圈、ISO、焦距、曝光补偿、测光、闪光灯和白平衡等 EXIF 子 IFD/GPS IFD 字段。
- 已通过设备 MediaStore 查询确认该 PNG 在系统媒体索引中只有 `datetaken` 可用，`latitude` 和 `longitude` 为空；这解释了系统相册或系统详情页只显示时间、不显示其它克隆信息的现象。
- 已查阅 Android 官方 MediaStore 文档，确认 Android 10 起图片纬度和经度列已废弃，位置详情不再索引且值始终为空；相机、镜头、曝光等字段也不是系统图片索引列。
- 当前结论：文件级 PNG 元数据已经写入，用户可见失败来自 Android/相册验收入口不读取 PNG 内部 EXIF/XMP/raw profile；若验收标准要求系统相册详情页像 JPEG 一样展示所有字段，PNG 文件格式和 Android 媒体索引路径无法提供同等能力。
- 已清理本轮用于分析设备输出 PNG 的临时目录，未在工作区保留用户样张副本。

### 修正 PNG MediaStore 索引复查结论

- 进一步查询设备 MediaStore 后，确认上一条记录中“系统媒体索引中只有 `datetaken` 可用”的表述不完整。
- 本轮最新 PNG 在设备 MediaStore 中除 `datetaken` 外，还可查询到 `exposure_time=0.01`、`f_number=4.4` 和 `iso=50`。
- 同一 PNG 在设备 MediaStore 中 `latitude` 和 `longitude` 仍为空；`make`、`model`、`focal_length`、`flash`、`white_balance` 等列在该设备媒体提供器中不可查询或不是有效列。
- 修正后的结论：文件内部元数据已包含多项克隆信息，系统媒体索引也保留了部分曝光字段，但当前设备相册或详情页仍可能只展示时间；这属于具体相册应用展示策略和系统索引字段范围问题，不等同于 PNG 文件未写入。

### 记录 PNG 排查代码回退状态

- 用户确认已亲自回退本轮 PNG 兼容写入、结果页标记和相关代码改动，准备从干净代码版本重新修改。
- 已检查当前工作区，确认除 `develop_log.md` 外没有其它源码或 README 改动。
- 当前保留内容仅为本轮排查过程、验证事实和结论记录；此前日志中提到的 PNG 兼容写入实现、结果页调整和 APK 安装事实属于已发生历史，不代表当前代码仍包含这些实现。
- 后续重新设计 PNG/JPEG 元数据克隆方案时，应以当前干净源码为准，并参考本日志中的验证结论：PNG 文件内部可写入多种元数据结构，但 Android MediaStore 和部分相册详情页不会按 JPEG 等价展示所有字段。

### 设计 PNG 目标克隆前输出格式确认

- 用户要求在克隆内容页面点击“开始克隆”时，如果目标图片是 PNG，先弹出提示并询问是否另存为 JPEG；弹窗左侧普通按钮继续保存 PNG，右侧蓝色按钮选择 JPEG。
- 目标效果：用户选择 PNG 目标并点击“开始克隆”后，会看到应用内弹窗说明 PNG 元数据在 Android 相册中的可见性限制；选择“继续保存 PNG”时维持原 PNG 输出路径，选择“另存为 JPEG”时 PNG 目标输出为 JPEG 副本后再写入 EXIF。
- 实现方案：JS 层根据目标照片 MIME、文件名或 URI 判断目标列表是否包含 PNG；只有包含 PNG 时拦截开始克隆并显示双按钮弹窗；克隆请求新增 `pngOutputMode` 参数传给 Android 原生模块。
- 实现方案：Android 原生模块在 `pngOutputMode=jpeg` 且目标格式检测为 PNG 时，把目标 PNG 解码后以白底重编码为 JPEG 临时文件，再使用 AndroidX ExifInterface 写入用户勾选的元数据并保存到 `Pictures/EXIF助手`。
- 风险边界：PNG 另存为 JPEG 会丢失透明通道并进行有损压缩；本轮使用白底合成和 JPEG 质量 95，优先换取 JPEG EXIF 的相册可见性。
- 本轮不做：不恢复上一轮 PNG raw profile/XMP 兼容写入实验，不改变 JPG/JPEG 目标的输出格式，不覆盖原照片。

### 实现 PNG 目标另存为 JPEG 选择

- 已新增 `PngOutputChoiceDialog` 应用内弹窗组件，复用现有遮罩、图标、标题、正文和按钮风格。
- 已在克隆内容页面的“开始克隆”入口增加 PNG 目标判断：目标包含 PNG 时显示弹窗，目标不包含 PNG 时直接执行原克隆流程。
- 已在弹窗中按用户要求设置左侧普通按钮“继续保存 PNG”和右侧蓝色按钮“另存为 JPEG”。
- 已扩展 JS 到原生的克隆请求类型，新增 `pngOutputMode`，取值为 `png` 或 `jpeg`。
- 已在 Android 原生模块中读取并校验 `pngOutputMode`；当目标实际检测为 PNG 且用户选择 JPEG 时，先把 PNG 解码并白底合成为 JPEG，再执行原有 EXIF 写入、写后校验和保存流程。
- 已更新 `README.md`，说明 PNG 目标克隆前会提示用户选择保留 PNG 或另存为 JPEG。

### 验证并安装 PNG 目标另存为 JPEG 选择

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `git diff --check`，未报告空白错误。
- 首次执行 `gradlew.bat assembleDebug --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行。
- 提权执行 `gradlew.bat assembleDebug --console=plain` 后 Android debug 构建成功，输出包含 `:app:compileDebugKotlin`、`:app:packageDebug`、`:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 构建输出仍包含 `TAG_ISO_SPEED_RATINGS` 弃用警告、Expo `NODE_ENV` 提示和 Gradle 弃用提示，但未导致构建失败。
- 已执行 `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`，设备返回 `Success`。
- 已通过 `dumpsys package com.local.exifhelper.debug` 确认设备上 debug 包 `versionName=1.0.0`，`lastUpdateTime` 为本轮安装时间。
- 已通过 `cmd package resolve-activity --brief com.local.exifhelper.debug` 确认 debug 启动入口为 `com.local.exifhelper.debug/com.local.exifhelper.MainActivity`。
- 剩余缺口：尚未在真机 UI 中手动选择 PNG 目标并分别点击“继续保存 PNG”和“另存为 JPEG”验证结果文件扩展名、相册显示和 EXIF 可见性。

### 增强 PNG 目标格式识别可靠性

- 已补充原生照片信息读取：当系统内容提供器未返回 MIME 时，根据图片文件头识别 PNG 或 JPEG，并把识别结果返回给 JS 层用于克隆前弹窗判断。
- 已调整目标格式检测顺序，写入前优先读取目标文件头确认 PNG 或 JPEG，再回退到 URI/MIME 推断，避免部分 `content://` PNG 因 URI 无扩展名而被提前当作 JPG。
- 已重新执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已重新执行 `git diff --check`，未报告空白错误。
- 首次普通执行 `gradlew.bat assembleDebug --console=plain` 仍因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行成功。
- 直接执行 `adb install -r android/app/build/outputs/apk/debug/app-debug.apk` 返回失败但未给出具体安装原因；随后改用 `adb push` 将 APK 推送到设备临时路径，并执行设备端 `pm install -r`，设备返回 `Success`。
- 已通过 `dumpsys package com.local.exifhelper.debug` 确认设备上 debug 包 `versionName=1.0.0`，`lastUpdateTime` 为本轮最终安装时间。
- 剩余缺口：尚未在真机 UI 中用系统选择器返回的真实 PNG 目标验证弹窗触发和 JPEG 输出结果。

### 修改导出副本命名规则

- 用户要求导出时不再完全重命名，而是在目标原名后追加 `_exifhelper_<时间戳>` 后缀，且时间戳应使用自然可读格式。
- 已将 Android 原生保存逻辑从 `EXIF助手_<毫秒时间戳>.<扩展名>` 改为 `<目标原名去扩展名>_exifhelper_yyyy-MM-dd_HH-mm-ss.<实际输出扩展名>`。
- 当 PNG 目标选择“另存为 JPEG”时，输出文件名保留 PNG 目标原始基名，但扩展名使用实际 JPEG 输出扩展名 `.jpg`。
- 已在文件名生成前清理路径分隔符、控制字符和 Windows/Android 常见非法文件名字符，避免目标原名导致保存失败。
- 已改进目标显示名来源：优先从 `content://` 的 `OpenableColumns.DISPLAY_NAME` 获取原文件名，缺失时再回退到 URI 最后路径段。
- 已更新 `README.md`，说明导出副本命名使用目标原名加 `_exifhelper_yyyy-MM-dd_HH-mm-ss` 后缀。

### 验证并安装导出命名规则

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `git diff --check`，未报告空白错误。
- 首次普通执行 `gradlew.bat assembleDebug --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行成功。
- 提权执行 `gradlew.bat assembleDebug --console=plain` 后 Android debug 构建成功，输出包含 `:app:compileDebugKotlin`、`:app:packageDebug`、`:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 构建输出仍包含 `TAG_ISO_SPEED_RATINGS` 弃用警告、Expo `NODE_ENV` 提示和 Gradle 弃用提示，但未导致构建失败。
- 已执行 `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`，设备返回 `Success`。
- 已通过 `dumpsys package com.local.exifhelper.debug` 确认设备上 debug 包 `versionName=1.0.0`，`lastUpdateTime` 为本轮安装时间。
- 剩余缺口：尚未在真机 UI 中执行一次克隆并查看 `Pictures/EXIF助手` 下实际输出文件名。

### 修正导出时间戳格式

- 用户纠正导出文件名中的时间戳格式：年月日之间应连起来，时分秒之间也应连起来。
- 已将导出命名后缀从 `_exifhelper_yyyy-MM-dd_HH-mm-ss` 调整为 `_exifhelper_yyyyMMdd_HHmmss`。
- 已同步 `README.md` 中的导出命名说明。

### 验证并安装导出时间戳格式修正

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `git diff --check`，未报告空白错误。
- 首次普通执行 `gradlew.bat assembleDebug --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行成功。
- 提权执行 `gradlew.bat assembleDebug --console=plain` 后 Android debug 构建成功，输出包含 `:app:compileDebugKotlin`、`:app:packageDebug`、`:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 已执行 `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`，设备返回 `Success`。
- 已通过 `dumpsys package com.local.exifhelper.debug` 确认设备上 debug 包 `versionName=1.0.0`，`lastUpdateTime` 为本轮安装时间。
- 剩余缺口：尚未在真机 UI 中执行一次克隆并查看实际导出文件名是否符合 `_exifhelper_yyyyMMdd_HHmmss`。

### 移除 Debug 包相机权限

- 用户询问为什么软件现在需要照相机权限。
- 已检查当前 Manifest 与合并 Manifest，确认项目主 Manifest 没有主动声明 `android.permission.CAMERA`；该权限由图片选择相关依赖在 Manifest 合并时带入。
- 已确认此前只在 Release overlay 中移除 `CAMERA` 权限，因此 Release 包不含相机权限，但 Debug 包仍会因依赖合并显示相机权限。
- 当前功能不提供直接拍照入口，不需要相机权限；已在主 Manifest 增加 `android.permission.CAMERA` 的 `tools:node="remove"`，使 Debug 和 Release 构建都移除该权限。
- 已更新 `README.md`，说明 Debug 和 Release 都移除相机权限。

### 验证 Debug 包相机权限移除

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `git diff --check`，未报告空白错误。
- 首次普通执行 `gradlew.bat assembleDebug --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行成功。
- 提权执行 `gradlew.bat assembleDebug --console=plain` 后 Android debug 构建成功，输出包含 `:app:processDebugManifest`、`:app:packageDebug`、`:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 已检查合并后的 Debug Manifest，未发现 `android.permission.CAMERA` 权限声明。
- 已执行 `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`，设备返回 `Success`。
- 已通过 `dumpsys package com.local.exifhelper.debug` 确认设备上 debug 包 `lastUpdateTime` 更新为本轮安装时间，且 `requested permissions` 与 `install permissions` 下不再包含 `android.permission.CAMERA`。

### 更新软件版本号到 1.0.1

- 用户要求将软件版本号提升到 `1.0.1` 并提交。
- 已将 `app.json`、`package.json` 和 `package-lock.json` 的项目版本更新为 `1.0.1`。
- 已将 Android `versionName` 更新为 `1.0.1`，并将 Android `versionCode` 从 `1` 提升到 `2`，保证后续 Android 安装升级编号递增。
- 已同步 `README.md` 和 `AGENTS.md` 中当前软件版本号说明。

### 验证 1.0.1 版本号更新

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误，命令输出显示项目版本为 `exif-helper@1.0.1`。
- 已执行 `git diff --check`，未报告空白错误。
- 首次普通执行 `gradlew.bat assembleDebug --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；按授权规则提权后重新执行成功。
- 提权执行 `gradlew.bat assembleDebug --console=plain` 后 Android debug 构建成功，输出包含 `:app:packageDebug`、`:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 已通过 Android SDK `aapt` 检查 Debug APK，确认包名为 `com.local.exifhelper.debug`，`versionCode=2`，`versionName=1.0.1`。

### 设计更多页体系

- 用户要求参考另一个软件的“关于”页面描述，在当前 EXIF助手 的“更多”页面中补充应用图标、应用名称、版本号、软件介绍、使用帮助、隐私政策、版本记录、检查更新和外部主页入口。
- 目标效果：用户从首页点击“更多”后，看到应用图标、应用名称、`版本：v1.0.1`、说明文档入口列表、检查更新入口和 GitHub 项目主页入口；点击返回按钮回到上一页。
- 目标效果：软件介绍面向普通用户说明 EXIF助手 的定位、核心功能、主要能力和使用特点；使用帮助按首页、选择照片、克隆内容、PNG 目标、结果页、权限和更多页说明操作路径。
- 目标效果：隐私政策说明数据记录范围、本地存储、导入导出与分享、权限与联网、用户控制；版本记录按版本倒序展示用户可感知变化。
- 目标效果：检查更新作为操作流程，支持检查中、无新版本、发现新版本、无安装包附件、下载中、下载失败、下载完成、已下载新版本、删除安装包、打开系统安装器和检查失败状态。
- 实现方案：更多主页面负责应用信息、入口列表、检查更新操作和项目主页；说明类页面使用独立导航页面，不在主页面内部用状态切换模拟完整页面。
- 实现方案：检查更新使用 GitHub Releases 最新发布接口，采用语义版本比较判断新版；下载 APK 后由 Android 原生模块校验包名和版本，再保存到应用专属目录。
- 风险边界：检查更新需要用户主动联网，Release 包需保留 `INTERNET` 权限；该变化不改变基础照片元数据克隆本地离线处理、不引入账号、云同步、广告、统计或后台上传。
- 本轮不做：不新增 iOS 更新流程，不新增应用商店更新，不实现云端配置或后台自动更新。

### 修正更多说明页导航实现

- 用户纠正：每个视觉上是完整页面的内容都应该注册进导航作为页面，并独立实现页面代码。
- 已按纠正调整方案：软件介绍、使用帮助、隐私政策和版本记录分别注册为独立导航路由，并分别实现独立 screen 文件。
- 更多主页面只保留集中入口、版本展示、检查更新操作、已有版本信息/隐私政策/权限设置说明和项目主页入口。

### 实现更多页体系和检查更新

- 已在导航类型和应用导航栈中新增 `SoftwareIntro`、`UsageHelp`、`PrivacyPolicy` 和 `VersionHistory` 路由。
- 已重写更多主页面：展示应用图标、应用名称、当前版本号、五个功能入口、已有版本信息/隐私政策/权限设置说明和 GitHub 项目主页入口。
- 已新增软件介绍页面，说明 EXIF助手 的本地照片元数据克隆定位、核心模块、主要功能和使用特点。
- 已新增使用帮助页面，按首页、选择源照片和目标照片、克隆内容页面、PNG 目标照片、结果页、权限或高级功能、更多页分组说明用户操作。
- 已新增隐私政策页面，按数据记录范围、本地存储、导入导出与分享、权限与联网、用户控制五组说明数据处理边界。
- 已新增版本记录页面，按 `v1.0.1` 和 `v1.0.0` 倒序展示用户可感知变化。
- 已扩展 Android 原生模块，提供应用版本读取、本地更新包检查、APK 下载、APK 删除和打开系统安装器能力。
- 已新增 FileProvider 路径配置，用于把应用专属目录中的已下载 APK 授权给系统安装器读取。
- 已调整 Android Manifest：保留 `INTERNET` 用于用户主动检查更新，新增 `REQUEST_INSTALL_PACKAGES` 用于安装用户确认下载的新版本，继续移除当前功能不需要的相机权限。
- 已同步 `README.md` 和 `AGENTS.md`，记录更多页体系、独立说明页面、用户主动检查更新、Release 网络权限边界和 APK 校验规则。

### 验证更多页体系和检查更新

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 首次在项目根目录执行 `android\gradlew.bat assembleDebug --console=plain` 因本机 Gradle wrapper 缓存锁文件访问被沙箱拒绝而失败；提权后因工作目录不是 Android Gradle 根目录而失败。
- 已改到 `android` 目录提权执行 `gradlew.bat assembleDebug --console=plain`，Android debug 构建成功，输出包含 `:app:compileDebugKotlin`、`:app:packageDebug`、`:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 已提权执行 `gradlew.bat assembleRelease --console=plain`，Android release 构建成功，输出包含 JS bundle 生成、`:app:packageRelease`、`:app:assembleRelease` 和 `BUILD SUCCESSFUL`。
- 已检查合并后的 Debug 和 Release Manifest，确认二者包含 `android.permission.INTERNET`、`android.permission.REQUEST_INSTALL_PACKAGES` 和应用自有 `androidx.core.content.FileProvider`。
- 已检查合并后的 Debug 和 Release Manifest，本轮搜索未发现 `android.permission.CAMERA` 权限声明。
- 已执行 `git diff --check`，未报告空白错误。
- 已确认当前没有连接的 ADB 设备，因此尚未在真实 Android 设备上手动点击更多页入口、各说明页面、项目主页和检查更新流程。

### 修正版本记录归属

- 用户指出本地已提交未推送的提交中已经存在版本号 `1.0.1`，本轮在该提交之后实现的更多页和检查更新不应写入 `v1.0.1` 版本记录。
- 已检查本地提交历史，确认 `HEAD` 为带 `1.0.1` 标签的 `[ver] Bump version to 1.0.1` 提交，且本轮更多页体系改动仍在工作区，属于 `1.0.1` 之后的新变化。
- 已将版本记录页顶部新增 `v1.0.2` 未发布节点，用于记录本轮新增的更多页体系、检查更新和项目主页入口。
- 已将 `v1.0.1` 节点调整为只记录版本号提交前已有的用户可见变化，包括 PNG 目标输出选择、导出命名优化、目标格式识别优化、顶部安全边距修复和相机权限移除。
- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误。
- 已执行 `git diff --check`，未报告空白错误。
- 已重新执行 `gradlew.bat assembleDebug --console=plain`，Android debug 构建成功，输出包含 `:app:assembleDebug` 和 `BUILD SUCCESSFUL`。
- 已执行 `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`，设备返回 `Success`。
- 已通过 `dumpsys package com.local.exifhelper.debug` 确认设备上 debug 包 `versionName=1.0.1`，`lastUpdateTime` 为本轮安装时间。

### 记录 Debug 包安装规则纠正

- 用户纠正：不是每次更改都要重装 debug 包，只有有必要的时候才重装。
- 已将该规则同步到 `AGENTS.md`：后续仅在需要真机验证当前 APK 内容、原生代码变更、权限或 Manifest 变更，或用户明确要求安装时重装 debug 包。
- 当前纠正不改变本轮已完成的版本记录修正内容，只调整后续验证和安装节奏。

### 修正未发布版本记录命名

- 用户要求版本记录页中未发布节点在发布之前应把版本号写为 `Unreleased`，不能提前写成具体版本号。
- 已将版本记录页顶部未发布节点从 `v1.0.2` 改为 `Unreleased`，发布日期仍显示“未发布”。
- 已将该规则同步到 `AGENTS.md`，后续发布定版前未发布节点使用 `Unreleased`，发布时再改为实际版本号和日期。

### 删除更多页重复版本信息卡片

- 用户指出更多页中的“版本信息”卡片与顶部应用图标大卡牌内容重复，可以删除。
- 已从更多页删除独立“版本信息”卡片，保留顶部大卡牌中的应用名称和 `版本：v当前版本` 作为版本展示入口。
- 本轮只调整更多页 JS 展示结构，不涉及原生代码、权限或 Manifest，因此不重装 debug 包。

### 删除更多页重复隐私政策卡片

- 用户指出更多页中隐私政策存在两个卡片，要求删除旧的重复卡片。
- 已从更多页底部删除旧的“隐私政策”说明卡片，保留入口列表中的“隐私政策”独立页面入口。
- 本轮只调整更多页 JS 展示结构，不涉及原生代码、权限或 Manifest，因此不重装 debug 包。

### 删除更多页无操作权限设置卡片

- 用户指出更多页“权限设置”卡片没有实际控制权限的能力，可以删除。
- 已从更多页删除“权限设置”说明卡片，权限相关说明保留在使用帮助和隐私政策独立页面中。
- 本轮只调整更多页 JS 展示结构，不涉及原生代码、权限或 Manifest，因此不重装 debug 包。

### 调整项目主页为跳转入口

- 用户指出项目主页应该做成点击跳转的入口，并调用浏览器打开。
- 已将项目主页从底部信息卡片调整为更多页入口列表中的可点击项目，视觉上与软件介绍、使用帮助、隐私政策、版本记录保持一致。
- 点击“项目主页”时继续调用系统浏览器打开 GitHub 项目页；打开失败时显示“打开失败，无法打开项目主页”提示。
- 本轮只调整更多页 JS 展示结构，不涉及原生代码、权限或 Manifest，因此不重装 debug 包。

### 调整更多主页面为无滚动布局

- 用户要求更多页应该做成无滚动页面。
- 已将更多主页面从 `ScrollView` 改为固定 `View` 布局，页面内容只包含顶部应用信息大卡牌和入口列表，不再提供页面滚动。
- 软件介绍、使用帮助、隐私政策和版本记录属于内容较长的独立说明页面，仍保留滚动阅读。
- 本轮只调整更多页 JS 展示结构和样式，不涉及原生代码、权限或 Manifest，因此不重装 debug 包。

### 更新软件版本号到 1.1.0

- 用户要求做 `1.1.0` 发布准备。
- 已将 `package.json`、`package-lock.json` 和 `app.json` 的软件版本更新为 `1.1.0`。
- 已将 Android `versionName` 更新为 `1.1.0`，并将 `versionCode` 从 `2` 提升到 `3`。
- 已将更多页版本读取失败兜底值更新为 `1.1.0`。
- 已将版本记录页顶部 `Unreleased` 节点定版为 `v1.1.0`，发布日期为 `2026-05-23`。
- 已同步 `README.md` 和 `AGENTS.md` 中当前软件版本号为 `1.1.0`。

### 验证并归档 1.1.0 Release APK

- 已执行 `npm run typecheck`，TypeScript 检查完成且未报告类型错误，命令输出显示项目版本为 `exif-helper@1.1.0`。
- 已执行 `gradlew.bat assembleRelease --console=plain`，Android release 构建成功，输出包含 JS bundle 生成、`:app:packageRelease`、`:app:assembleRelease` 和 `BUILD SUCCESSFUL`。
- 已通过 Android SDK `aapt` 检查 Release APK，确认包名为 `com.local.exifhelper`，`versionCode=3`，`versionName=1.1.0`，`minSdk=24`，`targetSdk=35`。
- 已检查 Release APK 权限，包含用户主动检查更新所需的 `android.permission.INTERNET` 和安装更新所需的 `android.permission.REQUEST_INSTALL_PACKAGES`，未发现 `android.permission.CAMERA`。
- 已按发布归档规则确认 `dist/EXIF_Helper-v1.1.0-android-20260523.apk` 不存在，避免覆盖已归档产物。
- 已从 Release APK 输出复制归档到 `dist/EXIF_Helper-v1.1.0-android-20260523.apk`。
- 已计算 Release 输出和归档 APK 的 SHA-256，二者均为 `607FA6CC29346A7915015E6DDF480F016BC886376077AACCD271E31C62AE9728`。
- 已确认 `dist/` 被 Git 忽略，归档产物不会进入开源仓库追踪。
- 本轮未安装 debug 包；本轮目标是发布准备和 Release APK 归档。
