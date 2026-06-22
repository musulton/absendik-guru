import AsyncStorage from "@react-native-async-storage/async-storage";

const APP_PREFS_KEY = "guru_app_preferences_v1";

export type Locale = "id" | "en";

export async function getAppLocale(): Promise<Locale> {
  try {
    const raw = await AsyncStorage.getItem(APP_PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { locale?: Locale };
      if (parsed.locale === "en" || parsed.locale === "id")
        return parsed.locale;
    }
  } catch {
    /* ignore */
  }
  return "id";
}

export type TranslationKey =
  | "app.name"
  | "app.tagline"
  | "common.save"
  | "common.cancel"
  | "common.done"
  | "common.back"
  | "common.or"
  | "common.loading"
  | "common.students"
  | "common.class"
  | "common.school"
  | "login.heroSubtitle"
  | "login.welcomeTitle"
  | "login.welcomeSub"
  | "login.featureAttendance"
  | "login.featureGrades"
  | "login.featureRecap"
  | "login.google"
  | "login.googleHint"
  | "login.googleProviderDisabled"
  | "login.googleCallbackFailed"
  | "login.googleLocalhostRedirect"
  | "login.googleOAuthWebOrigin"
  | "login.googleOAuthTimeout"
  | "login.googleOAuthCancelled"
  | "login.googleSignInFailed"
  | "login.googleRedirectUriMismatch"
  | "login.googleCloudSetupTitle"
  | "login.googleCloudSetupHint"
  | "login.googleSimulatorHint"
  | "login.googleExpoGoSetupTitle"
  | "login.googleExpoGoSessionTitle"
  | "login.googleExpoGoSetupHint"
  | "login.emailToggle"
  | "login.emailHide"
  | "login.email"
  | "login.password"
  | "login.emailSubmit"
  | "login.emailHint"
  | "login.schoolLinkHint"
  | "classes.hintTitle"
  | "classes.hintBodyClass"
  | "classes.hintBodySubject"
  | "classes.tapToAttendance"
  | "classes.tapToSubjects"
  | "classes.tapToSubjectsGrades"
  | "classes.empty"
  | "classes.emptySchool"
  | "classes.hintBodySchool"
  | "classes.addClass"
  | "classes.addClassHint"
  | "classes.manageHint"
  | "classes.tapToManage"
  | "classes.emptyHome"
  | "subjects.tapToManage"
  | "subjects.hintTitle"
  | "subjects.hintBody"
  | "subjects.hintBodyGrades"
  | "subjects.hintBodyBoth"
  | "subjects.tapToAttendance"
  | "subjects.empty"
  | "subjects.noStudents"
  | "subjects.addStudent"
  | "subjects.manageHint"
  | "attendance.today"
  | "attendance.hint"
  | "attendance.saved"
  | "attendance.save"
  | "attendance.edit"
  | "attendance.editHint"
  | "attendance.readOnlyHint"
  | "attendance.editingHint"
  | "attendance.noStudents"
  | "attendance.addStudent"
  | "attendance.notePlaceholder"
  | "attendance.noteToggle"
  | "attendance.noteHide"
  | "attendance.tapStudentDetail"
  | "attendance.pickDateHint"
  | "datePicker.title"
  | "attendance.notFuture"
  | "attendance.goToday"
  | "attendance.setAllPresent"
  | "attendance.incompleteStatus"
  | "grades.hint"
  | "grades.addTask"
  | "grades.noTasks"
  | "grades.titlePlaceholder"
  | "grades.titleLabel"
  | "grades.studentColumnLabel"
  | "grades.scoreColumnLabel"
  | "grades.scorePlaceholder"
  | "grades.titleRequired"
  | "grades.saved"
  | "grades.taskAdded"
  | "grades.edit"
  | "grades.readOnlyHint"
  | "grades.editingHint"
  | "grades.scoreFilled"
  | "grades.deleteTitle"
  | "grades.deleteBody"
  | "grades.deleteAction"
  | "grades.recapEmpty"
  | "grades.recapTaskCount"
  | "grades.recapStudentSummary"
  | "grades.recapStudentSummaryNoAvg"
  | "grades.recapTaskFraction"
  | "grades.recapViewList"
  | "grades.recapViewTable"
  | "grades.recapMetaSummary"
  | "gradePredikat.title"
  | "gradePredikat.desc"
  | "gradePredikat.sectionBands"
  | "gradePredikat.labelField"
  | "gradePredikat.minField"
  | "gradePredikat.minAuto"
  | "gradePredikat.hint"
  | "gradePredikat.save"
  | "gradePredikat.reset"
  | "gradePredikat.resetConfirm"
  | "gradePredikat.saved"
  | "gradePredikat.schoolReadOnly"
  | "gradePredikat.tierHighest"
  | "gradePredikat.tierLowest"
  | "grades.listTitle"
  | "grades.listSearchPlaceholder"
  | "grades.listPredikatLabel"
  | "grades.listPredikatChoose"
  | "grades.listFilterAll"
  | "grades.listFilterRemedial"
  | "grades.listFilterAverageBand"
  | "grades.listFilterToggle"
  | "grades.listShowingCount"
  | "grades.listEmpty"
  | "grades.reload"
  | "grades.exportExcel"
  | "schedule.title"
  | "schedule.hint"
  | "schedule.empty"
  | "schedule.add"
  | "schedule.remove"
  | "schedule.start"
  | "schedule.end"
  | "schedule.pickTime"
  | "studentDetail.title"
  | "studentDetail.summary"
  | "studentDetail.history"
  | "studentDetail.empty"
  | "studentDetail.records"
  | "studentDetail.filteredSubject"
  | "studentGradeDetail.title"
  | "studentGradeDetail.summary"
  | "studentGradeDetail.scoredCount"
  | "studentGradeDetail.history"
  | "studentGradeDetail.empty"
  | "studentGradeDetail.records"
  | "studentGradeDetail.filteredSubject"
  | "studentGradeDetail.exportExcel"
  | "students.hint"
  | "students.hintSchool"
  | "students.manageHint"
  | "school.readonlyTitle"
  | "school.noStudentsHint"
  | "students.empty"
  | "class.nameLabel"
  | "class.nameRequired"
  | "class.labelColor"
  | "class.deleteTitle"
  | "class.deleteBody"
  | "class.deleteAction"
  | "subject.nameLabel"
  | "subject.nameRequired"
  | "subject.deleteTitle"
  | "subject.deleteBody"
  | "subject.deleteAction"
  | "recap.metaSummary"
  | "recap.periodWeekly"
  | "recap.periodMonthly"
  | "recap.periodSemester"
  | "recap.periodLabel"
  | "recap.choosePeriod"
  | "recap.segmentWeekly"
  | "recap.segmentMonthly"
  | "recap.segmentSemester"
  | "recap.needSubject"
  | "recap.subjectLabel"
  | "recap.chooseSubject"
  | "recap.pctColumn"
  | "recap.totalRow"
  | "recap.studentsCol"
  | "recap.emptyTitle"
  | "recap.emptyWeekly"
  | "recap.emptyMonthly"
  | "recap.emptySemester"
  | "student.quotaTitle"
  | "student.quotaUsage"
  | "student.quotaLimit"
  | "student.quotaPro"
  | "student.fullName"
  | "student.number"
  | "student.nameRequired"
  | "student.classLabel"
  | "student.deleteTitle"
  | "student.deleteBody"
  | "student.deleteAction"
  | "about.title"
  | "about.subtitle"
  | "about.whatIs"
  | "about.whatIsBody"
  | "about.howToUse"
  | "about.step1"
  | "about.step2"
  | "about.step3"
  | "about.step4"
  | "about.featuresTitle"
  | "about.featureGrades"
  | "about.featurePredikat"
  | "about.featureSchoolLink"
  | "about.featureCloud"
  | "about.plansHint"
  | "about.schoolHint"
  | "about.footer"
  | "settings.title"
  | "settings.appearance"
  | "settings.language"
  | "settings.languageId"
  | "settings.languageEn"
  | "settings.darkMode"
  | "settings.darkModeLight"
  | "settings.darkModeDark"
  | "settings.darkModeAuto"
  | "settings.fontSize"
  | "settings.fontSizeStandard"
  | "settings.fontSizeLarge"
  | "settings.fontSizeHint"
  | "settings.haptics"
  | "settings.hapticsHint"
  | "settings.teachReminders"
  | "settings.teachRemindersHint"
  | "settings.account"
  | "settings.about"
  | "settings.aboutSub"
  | "settings.switchSchoolProSub"
  | "settings.modulesSection"
  | "settings.gradePredikatSection"
  | "settings.gradePredikat"
  | "settings.gradePredikatSub"
  | "settings.helpSection"
  | "settings.moduleAttendance"
  | "settings.moduleGrades"
  | "settings.modulesHint"
  | "settings.modulesMinOne"
  | "settings.package"
  | "settings.packageIntro"
  | "settings.freePlanLead"
  | "settings.freePlanBadge"
  | "settings.freeIncludesTitle"
  | "settings.proPlanLead"
  | "settings.proUnlockTitle"
  | "settings.proIncludesTitle"
  | "settings.proUpgradeHint"
  | "settings.proDevUnlockHint"
  | "settings.subscribeAlertTitle"
  | "settings.subscribeAlertBody"
  | "settings.subscribeAlertBodyAndroid"
  | "settings.restorePurchase"
  | "settings.iapUnavailable"
  | "settings.iapIosSoon"
  | "settings.proPrice"
  | "settings.signOut"
  | "settings.signOutConfirm"
  | "settings.freeDesc"
  | "settings.proDesc"
  | "settings.upgradePro"
  | "settings.proActive"
  | "settings.proDeviceConflict"
  | "settings.proDeviceConflictBody"
  | "settings.proDeviceUnknown"
  | "settings.transferDevice"
  | "settings.transferDeviceConfirm"
  | "settings.transferDeviceSuccess"
  | "settings.cloud"
  | "settings.cloudIntro"
  | "settings.sync"
  | "settings.syncDesc"
  | "settings.restore"
  | "settings.restoreDesc"
  | "settings.cloudHint"
  | "settings.autoCloudSync"
  | "settings.autoCloudSyncHint"
  | "workspace.badgeSchool"
  | "workspace.badgeLocal"
  | "workspace.badgeLocalArchive"
  | "workspace.localArchiveHint"
  | "workspace.localArchiveBanner"
  | "workspace.openLocalArchive"
  | "workspace.openLocalArchiveBody"
  | "workspace.localArchiveScreenTitle"
  | "workspace.localArchiveScreenHint"
  | "workspace.localArchiveCount"
  | "workspace.localArchiveEmptyTitle"
  | "workspace.localArchiveEmptyBody"
  | "createWorkspace.linkedSchoolExists"
  | "settings.danger"
  | "settings.wipe"
  | "settings.wipeHint"
  | "settings.dataHint"
  | "settings.adPrivacy"
  | "settings.adPrivacySub"
  | "pkg.free.school"
  | "pkg.free.students"
  | "pkg.free.classes"
  | "pkg.free.recap"
  | "pkg.free.excel"
  | "pkg.free.local"
  | "pkg.free.ads"
  | "pkg.pro.school"
  | "pkg.pro.classes"
  | "pkg.pro.students"
  | "pkg.pro.semester"
  | "pkg.pro.cloud"
  | "pkg.pro.sync"
  | "pkg.pro.restore"
  | "pkg.pro.noads"
  | "nav.tabHome"
  | "nav.tabClasses"
  | "nav.tabRecap"
  | "nav.tabAccount"
  | "nav.tabManage"
  | "nav.tabSettings"
  | "nav.tabManageClasses"
  | "nav.tabManageSubjects"
  | "nav.tabManageStudents"
  | "nav.greeting"
  | "nav.quickActions"
  | "nav.recentClasses"
  | "nav.statClasses"
  | "nav.statStudents"
  | "nav.statSubjects"
  | "nav.switchSchool"
  | "nav.switchSchoolSub"
  | "nav.emptyHomeTitle"
  | "nav.emptyHomeBody"
  | "nav.classListTitle"
  | "nav.classListBodyClass"
  | "nav.classListBodySubject"
  | "nav.openClass"
  | "nav.classActions"
  | "nav.attendanceToday"
  | "nav.attendance"
  | "nav.students"
  | "nav.recap"
  | "nav.grades"
  | "nav.gradeRecap"
  | "nav.manageClass"
  | "nav.manageSubject"
  | "nav.subjectsSection"
  | "nav.addSubject"
  | "nav.editSubject"
  | "nav.editStudent"
  | "nav.modeClass"
  | "nav.noChanges"
  | "nav.subjectSaved"
  | "nav.recapTitle"
  | "nav.recapBody"
  | "nav.viewRecap"
  | "nav.accountSection"
  | "nav.schoolSection"
  | "nav.sessionSection"
  | "nav.guide"
  | "nav.guideSub"
  | "nav.allClasses"
  | "classPicker.subjects"
  | "classPicker.students"
  | "classPicker.tapToOpen"
  | "manage.hubHint"
  | "manage.hubClasses"
  | "manage.hubClassesSub"
  | "manage.hubSubjects"
  | "manage.hubSubjectsSub"
  | "manage.hubStudents"
  | "manage.hubStudentsSub"
  | "home.hubHint"
  | "home.hubAttendanceSub"
  | "home.hubGradesSub"
  | "home.noModulesHint"
  | "home.tapClassForAttendance"
  | "home.tapClassForGrades"
  | "home.tapClassPickModule"
  | "home.openManageSub"
  | "home.classModuleHint"
  | "home.classesHint"
  | "home.classesSubjectHint"
  | "home.classesAttendanceHint"
  | "home.classesSubjectAttendanceHint"
  | "home.classesGradesHint"
  | "home.classesSubjectGradesHint"
  | "home.moduleClassesAttendanceHint"
  | "home.moduleClassesGradesHint"
  | "home.moduleClassesSubjectAttendanceHint"
  | "home.moduleClassesSubjectGradesHint"
  | "home.moduleSubjectAttendanceHint"
  | "home.moduleSubjectGradesHint"
  | "home.tapSubjectForAttendance"
  | "home.tapSubjectForGrades"
  | "modules.attendance"
  | "modules.grades"
  | "common.optional"
  | "common.loginFailed"
  | "common.menu"
  | "workspace.pickSchool"
  | "workspace.addSchool"
  | "workspace.emptyTitle"
  | "workspace.emptyBody"
  | "workspace.notLinkedSchoolHint"
  | "workspace.manualPickHint"
  | "workspace.freeLimitTitle"
  | "workspace.freeLimitBody"
  | "bootstrap.retry"
  | "bootstrap.signOut"
  | "bootstrap.profileLoadFailed"
  | "bootstrap.networkHint"
  | "bootstrap.sessionLoadFailed"
  | "onboarding.welcomeNav"
  | "onboarding.skip"
  | "onboarding.next"
  | "onboarding.start"
  | "onboarding.stepA11y"
  | "onboarding.welcome.title"
  | "onboarding.welcome.body"
  | "onboarding.storage.title"
  | "onboarding.storage.body"
  | "onboarding.storage.bullet1"
  | "onboarding.storage.bullet2"
  | "onboarding.school.title"
  | "onboarding.school.body"
  | "onboarding.school.bullet1"
  | "onboarding.school.bullet2"
  | "onboarding.schoolLink.title"
  | "onboarding.schoolLink.body"
  | "onboarding.schoolLink.bullet1"
  | "onboarding.schoolLink.bullet2"
  | "onboarding.schoolLink.bullet3"
  | "onboarding.class.title"
  | "onboarding.class.body"
  | "onboarding.class.bullet1"
  | "onboarding.class.bullet2"
  | "onboarding.class.bullet3"
  | "onboarding.attendance.title"
  | "onboarding.attendance.body"
  | "onboarding.attendance.bullet1"
  | "onboarding.attendance.bullet2"
  | "onboarding.attendance.bullet3"
  | "onboarding.grades.title"
  | "onboarding.grades.body"
  | "onboarding.grades.bullet1"
  | "onboarding.grades.bullet2"
  | "onboarding.grades.bullet3"
  | "onboarding.more.title"
  | "onboarding.more.body"
  | "onboarding.more.bullet1"
  | "onboarding.more.bullet2"
  | "onboarding.more.bullet3"
  | "onboarding.more.bullet4"
  | "onboarding.startStep.title"
  | "onboarding.startStep.body"
  | "onboarding.startStep.bullet1"
  | "createWorkspace.nameRequired"
  | "createWorkspace.levelRequired"
  | "createWorkspace.cityRequired"
  | "createWorkspace.hint"
  | "createWorkspace.nameLabel"
  | "createWorkspace.namePlaceholder"
  | "createWorkspace.levelLabel"
  | "createWorkspace.cityLabel"
  | "createWorkspace.cityPlaceholder"
  | "createWorkspace.showExtra"
  | "createWorkspace.hideExtra"
  | "createWorkspace.npsn"
  | "createWorkspace.province"
  | "createWorkspace.address"
  | "createWorkspace.pic"
  | "createWorkspace.phone"
  | "createWorkspace.email"
  | "createWorkspace.attendanceSection"
  | "createWorkspace.modeSubject"
  | "quota.unlimitedSchools"
  | "quota.schoolCount"
  | "quota.unlimitedStudents"
  | "quota.studentLimit"
  | "quota.unlimitedClassesPerSchool"
  | "quota.classLimitPerSchool"
  | "quota.unlimitedSubjects"
  | "quota.classesSubjects"
  | "settings.proActivateFailed"
  | "menu.settings"
  | "menu.switchSchool"
  | "menu.signOut"
  | "classMenu.weeklyRecap"
  | "classMenu.editOrDelete"
  | "ads.sponsorTitle"
  | "ads.placement.attendanceSaved"
  | "ads.placement.gradeSaved"
  | "ads.placement.recapExport"
  | "ads.placement.syncComplete"
  | "ads.placement.default"
  | "ads.mockLabel"
  | "ads.mockSub"
  | "ads.continue"
  | "ads.upgradeProNoAds"
  | "ads.bannerHint"
  | "ads.upgradeShort"
  | "export.shareRecap"
  | "export.shareGradeRecap"
  | "export.shareGradeHistory"
  | "export.noData"
  | "export.semesterRecapPro"
  | "export.semesterGradePro"
  | "export.loadRecapFirst"
  | "export.createFileFailed"
  | "export.shareUnsupported"
  | "export.confirmTitle"
  | "export.confirmMessage"
  | "export.confirmMessageAndroid"
  | "export.confirmContinue"
  | "export.exportCancelled"
  | "export.storagePermissionTitle"
  | "export.storagePermissionMessage"
  | "export.storagePermissionDenied"
  | "student.quotaAtMax"
  | "error.notSignedIn"
  | "error.noServerResponse"
  | "error.serverInvalidResponse"
  | "error.connectionFailed"
  | "error.requestFailed"
  | "error.schoolClassesLoadFailed"
  | "error.schoolGradesLoadFailed"
  | "error.schoolGradesSaveFailed"
  | "error.schoolGradeRecapLoadFailed"
  | "error.generic"
  | "cloud.needPro"
  | "cloud.nothingToBackup"
  | "cloud.needProRestore"
  | "cloud.noBackupYet"
  | "local.dbOpenFailed"
  | "local.freeSchoolLimit"
  | "local.classLimitBody"
  | "cloud.restoreFailed"
  | "iap.purchaseInProgress"
  | "workspace.schoolQuotaFull"
  | "iap.cancelled"
  | "iap.purchaseFailed"
  | "iap.tokenMissing"
  | "iap.noActiveSubscription"
  | "iap.openPlayFailed"
  | "iap.restoreFailed";

const id: Record<TranslationKey, string> = {
  "app.name": "Absendik Guru",
  "app.tagline": "Absensi & nilai per kelas atau mapel — dari genggaman guru",
  "common.save": "Simpan",
  "common.cancel": "Batal",
  "common.done": "Selesai",
  "common.back": "Kembali",
  "common.or": "atau",
  "common.loading": "Memuat…",
  "common.students": "siswa",
  "common.class": "Kelas",
  "common.school": "Sekolah",
  "login.heroSubtitle":
    "Catat, nilai, dan rekap laporan siswa lebih cepat — cukup dari HP Anda.",
  "login.welcomeTitle": "Halo, Guru!",
  "login.welcomeSub": "Masuk sekali, langsung kelola kelas di genggaman.",
  "login.featureAttendance": "Absensi",
  "login.featureGrades": "Nilai",
  "login.featureRecap": "Rekap Laporan",
  "login.google": "Masuk dengan Google",
  "login.googleHint": "Paling cepat — pakai akun Google yang sudah ada",
  "login.googleProviderDisabled":
    "Login Google belum tersedia. Gunakan email dan kata sandi, atau hubungi admin sekolah.",
  "login.googleCallbackFailed":
    "Login Google tidak selesai. Coba lagi atau gunakan email dan kata sandi.",
  "login.googleLocalhostRedirect":
    "Login Google tidak dapat kembali ke aplikasi. Coba lagi dengan koneksi internet stabil.",
  "login.googleOAuthWebOrigin":
    "OAuth web belum benar. Set EXPO_PUBLIC_OAUTH_WEB_ORIGIN=https://demo.absendik.id (HTTPS publik, bukan IP lokal).",
  "login.googleOAuthTimeout":
    "Login Google terlalu lama. Coba lagi atau gunakan email dan kata sandi.",
  "login.googleOAuthCancelled": "Login Google dibatalkan.",
  "login.googleSignInFailed":
    "Login Google gagal. Coba lagi atau gunakan email dan kata sandi.",
  "login.googleRedirectUriMismatch":
    "Login Google belum dikonfigurasi. Hubungi admin untuk menambahkan redirect URI Supabase di Google Cloud Console.",
  "login.googleCloudSetupTitle": "Dev — Google Cloud Authorized redirect URI:",
  "login.googleCloudSetupHint":
    "OAuth client tipe Web application. Client ID/Secret yang sama dipakai di Supabase → Providers → Google.",
  "login.googleSimulatorHint":
    "Mode pengembang: salin URL redirect ke pengaturan server jika login Google gagal.",
  "login.googleExpoGoSetupTitle": "Dev — Supabase Redirect URLs (tetap):",
  "login.googleExpoGoSessionTitle": "Redirect sesi ini (otomatis):",
  "login.googleExpoGoSetupHint":
    "Set EXPO_PUBLIC_OAUTH_WEB_ORIGIN = Site URL Supabase (HTTPS). Setelah login Google, halaman web meneruskan ke aplikasi.",
  "login.emailToggle": "Email dan kata sandi",
  "login.emailHide": "Tutup",
  "login.email": "Email",
  "login.password": "Kata sandi",
  "login.emailSubmit": "Masuk",
  "login.emailHint": "Gunakan email yang terhubung dengan Absendik Sekolah.",
  "login.schoolLinkHint":
    "Absendik Guru hadir untuk membantu absensi dan nilai — per rombel atau per mata pelajaran. Waktu Anda lebih berharga untuk mendidik daripada administrasi.",
  "classes.hintTitle": "Mulai dari kelas",
  "classes.hintBodyClass":
    "Gunakan tombol absensi atau nilai di setiap kelas. Tombol menu lainnya untuk siswa, rekap, dan kelola kelas.",
  "classes.hintBodySubject":
    "Pilih kelas terlebih dahulu, lalu pilih mata pelajaran untuk absensi atau nilai.",
  "classes.tapToAttendance": "Isi absensi",
  "classes.tapToSubjects": "Pilih mata pelajaran",
  "classes.tapToSubjectsGrades": "Kelola mapel & nilai",
  "classes.empty": "Belum ada kelas. Ketuk + untuk menambahkan kelas pertama.",
  "classes.emptySchool":
    "Belum ada kelas yang ditugaskan ke Anda. Minta admin sekolah menugaskan kelas/mapel di Absendik Sekolah.",
  "classes.hintBodySchool":
    "Kelas dan siswa dari Absendik Sekolah. Anda bisa absensi dan nilai; penambahan kelas/siswa lewat admin sekolah.",
  "classes.addClass": "Tambah kelas",
  "classes.addClassHint": "Contoh: VII-A, VIII-B, atau Kelompok Tahfidz.",
  "classes.manageHint":
    "Kelola daftar kelas. Ketuk kelas untuk mengubah atau menghapus.",
  "classes.tapToManage": "Kelola kelas",
  "classes.emptyHome":
    "Belum ada kelas. Ketuk Pengelolaan di atas untuk menambahkan kelas pertama.",
  "subjects.tapToManage": "Kelola mapel",
  "subjects.hintTitle": "Pilih mata pelajaran",
  "subjects.hintBody":
    "Ikon siswa (kanan atas) untuk kelola siswa, ikon buku untuk tambah mapel. Ketuk jumlah siswa di atas juga bisa.",
  "subjects.hintBodyGrades":
    "Ikon siswa untuk kelola siswa, ikon buku untuk tambah mapel. Ketuk mapel untuk input nilai.",
  "subjects.hintBodyBoth":
    "Ikon siswa untuk kelola siswa, ikon buku untuk tambah mapel. Ketuk ikon absensi atau nilai di setiap mapel.",
  "subjects.tapToAttendance": "Isi absensi",
  "subjects.empty":
    "Belum ada mata pelajaran. Ketuk + di kanan atas untuk menambahkan.",
  "subjects.noStudents": "Belum ada siswa di kelas ini.",
  "subjects.addStudent": "Tambah siswa",
  "subjects.manageHint":
    "Kelola mata pelajaran kelas ini. Ketuk mapel untuk mengubah atau menghapus.",
  "attendance.today": "Hari ini",
  "attendance.hint":
    "Pilih Hadir, Sakit, Izin, atau Alpha. Ketuk nama untuk riwayat, atau ikon catatan untuk keterangan.",
  "attendance.saved": "Absensi tersimpan",
  "attendance.save": "Simpan absensi",
  "attendance.edit": "Ubah absensi",
  "attendance.editHint": "Ubah status lalu ketuk Simpan.",
  "attendance.readOnlyHint":
    "Absensi tanggal ini sudah tersimpan. Ketuk Ubah absensi di bawah untuk mengedit.",
  "attendance.editingHint": "Ubah status lalu ketuk Simpan absensi.",
  "attendance.noStudents": "Belum ada siswa di kelas ini.",
  "attendance.addStudent": "Tambah siswa",
  "attendance.notePlaceholder": "Keterangan (opsional)",
  "attendance.noteToggle": "Catatan",
  "attendance.noteHide": "Sembunyikan",
  "attendance.tapStudentDetail": "Ketuk untuk melihat riwayat absensi",
  "attendance.pickDateHint": "Ketuk tanggal untuk memilih hari lain",
  "datePicker.title": "Pilih tanggal",
  "attendance.notFuture": "Absensi tidak bisa dibuat untuk tanggal mendatang.",
  "attendance.goToday": "Ke hari ini",
  "attendance.setAllPresent": "Set semua hadir",
  "attendance.incompleteStatus":
    "Pilih status absensi untuk semua siswa terlebih dahulu.",
  "grades.hint":
    "Dalam satu hari, Anda bisa membuat beberapa tugas. Buka tugas untuk mengisi judul dan nilai siswa.",
  "grades.addTask": "Tambah tugas",
  "grades.noTasks":
    "Belum ada tugas pada tanggal ini. Tambahkan tugas untuk mulai mengisi nilai.",
  "grades.titlePlaceholder": "Judul tugas (mis. Ulangan Harian Bab 2)",
  "grades.titleLabel": "Judul tugas",
  "grades.studentColumnLabel": "Nama siswa",
  "grades.scoreColumnLabel": "Nilai",
  "grades.scorePlaceholder": "0–100",
  "grades.titleRequired": "Judul tugas wajib diisi.",
  "grades.saved": "Nilai tugas tersimpan",
  "grades.taskAdded": "Tugas baru ditambahkan",
  "grades.edit": "Ubah nilai",
  "grades.readOnlyHint":
    "Nilai sudah tersimpan. Buka tugas untuk melihat, atau ketuk Ubah nilai untuk mengedit.",
  "grades.editingHint": "Ubah judul atau nilai lalu ketuk Simpan.",
  "grades.scoreFilled": "{filled}/{total} nilai",
  "grades.deleteTitle": "Hapus tugas?",
  "grades.deleteBody": 'Tugas "{title}" dan nilainya akan dihapus.',
  "grades.deleteAction": "Hapus tugas",
  "grades.recapEmpty": "Belum ada nilai pada periode yang dipilih.",
  "grades.recapTaskCount": "{count} tugas tercatat",
  "grades.recapStudentSummary":
    "{scored} dari {total} tugas · rata-rata {average}",
  "grades.recapStudentSummaryNoAvg": "{scored} dari {total} tugas",
  "grades.recapTaskFraction": "{scored}/{total} tugas",
  "grades.recapViewList": "Daftar",
  "grades.recapViewTable": "Tabel",
  "grades.recapMetaSummary": "{students} siswa · {tasks} nilai tercatat",
  "gradePredikat.title": "Predikat nilai",
  "gradePredikat.desc":
    "Atur label dan ambang batas predikat untuk rekap nilai. Warna predikat tetap sama; yang bisa disesuaikan label dan rentang nilainya.",
  "gradePredikat.sectionBands": "Rentang predikat",
  "gradePredikat.labelField": "Label",
  "gradePredikat.minField": "Min",
  "gradePredikat.minAuto": "Otomatis < Cukup",
  "gradePredikat.hint":
    "Ambang harus turun: Sangat baik > Baik > Cukup (1–100). Nilai di bawah Cukup masuk predikat terendah.",
  "gradePredikat.save": "Simpan pengaturan",
  "gradePredikat.reset": "Kembalikan default",
  "gradePredikat.resetConfirm":
    "Kembalikan predikat ke default (≥90 / ≥80 / ≥70)?",
  "gradePredikat.saved": "Pengaturan predikat tersimpan.",
  "gradePredikat.schoolReadOnly":
    "Sekolah terhubung ke Absendik Sekolah — predikat diatur admin di portal web.",
  "gradePredikat.tierHighest": "Tertinggi",
  "gradePredikat.tierLowest": "Terendah",
  "grades.listTitle": "Daftar nilai",
  "grades.listSearchPlaceholder": "Cari nama atau NIS",
  "grades.listPredikatLabel": "Predikat",
  "grades.listPredikatChoose": "Pilih predikat",
  "grades.listFilterAll": "Semua predikat",
  "grades.listFilterRemedial": "Ada nilai kurang (remedial)",
  "grades.listFilterAverageBand": "Rata-rata {band}",
  "grades.listFilterToggle": "Cari & filter",
  "grades.listShowingCount": "Menampilkan {shown} dari {total} siswa",
  "grades.listEmpty": "Tidak ada siswa yang cocok dengan filter.",
  "grades.reload": "Muat ulang",
  "grades.exportExcel": "Unduh Excel",
  "schedule.title": "Jadwal mengajar",
  "schedule.hint":
    "Opsional. Pilih satu atau lebih hari dengan jam yang sama. Dipakai untuk pengingat sebelum kelas.",
  "schedule.empty":
    "Belum ada jadwal mengajar. Tambahkan jika ingin menerima pengingat.",
  "schedule.add": "Tambah jadwal",
  "schedule.remove": "Hapus",
  "schedule.start": "Mulai",
  "schedule.end": "Selesai",
  "schedule.pickTime": "Pilih jam",
  "studentDetail.title": "Riwayat absensi",
  "studentDetail.summary": "Ringkasan",
  "studentDetail.history": "Riwayat harian",
  "studentDetail.empty": "Belum ada catatan absensi untuk siswa ini.",
  "studentDetail.records": "{count} hari tercatat",
  "studentDetail.filteredSubject": "Mata pelajaran: {subject}",
  "studentGradeDetail.title": "Riwayat nilai",
  "studentGradeDetail.summary": "Ringkasan",
  "studentGradeDetail.scoredCount": "{count} tugas memiliki nilai",
  "studentGradeDetail.history": "Riwayat tugas",
  "studentGradeDetail.empty": "Belum ada nilai tugas untuk siswa ini.",
  "studentGradeDetail.records": "{count} tugas tercatat",
  "studentGradeDetail.filteredSubject": "Mata pelajaran: {subject}",
  "studentGradeDetail.exportExcel": "Unduh Excel",
  "students.hint":
    "Ketuk ikon absensi atau nilai untuk melihat riwayat siswa. Ikon ⋯ untuk mengubah data.",
  "students.hintSchool":
    "Daftar siswa dari Absendik Sekolah. Penambahan atau perubahan data lewat admin sekolah.",
  "students.manageHint":
    "Kelola daftar siswa kelas ini. Ketuk siswa untuk mengubah atau menghapus.",
  "school.readonlyTitle": "Dikelola admin sekolah",
  "school.noStudentsHint":
    "Belum ada siswa di kelas ini. Minta admin sekolah menambahkan siswa di Absendik Sekolah.",
  "students.empty": "Belum ada siswa. Ketuk + untuk menambahkan siswa.",
  "class.nameLabel": "Nama kelas",
  "class.nameRequired": "Nama kelas wajib diisi.",
  "class.labelColor": "Warna label",
  "class.deleteTitle": "Hapus kelas?",
  "class.deleteBody":
    "Kelas dan semua siswa di dalamnya akan dihapus. Tindakan ini tidak dapat dibatalkan.",
  "class.deleteAction": "Hapus kelas",
  "subject.nameLabel": "Nama mata pelajaran",
  "subject.nameRequired": "Nama mata pelajaran wajib diisi.",
  "subject.deleteTitle": "Hapus mata pelajaran {name}?",
  "subject.deleteBody": "Mata pelajaran dan jadwal mengajarnya akan dihapus.",
  "subject.deleteAction": "Hapus mata pelajaran",
  "recap.metaSummary": "{students} siswa · {days} hari tercatat",
  "recap.periodWeekly": "Mingguan",
  "recap.periodMonthly": "Bulanan",
  "recap.periodSemester": "Semester",
  "recap.periodLabel": "Periode",
  "recap.choosePeriod": "Pilih periode",
  "recap.segmentWeekly": "Minggu",
  "recap.segmentMonthly": "Bulan",
  "recap.segmentSemester": "Semester",
  "recap.needSubject":
    "Tambahkan mata pelajaran terlebih dahulu untuk melihat rekap per mata pelajaran.",
  "recap.subjectLabel": "Mata pelajaran",
  "recap.chooseSubject": "Pilih mata pelajaran",
  "recap.pctColumn": "% hadir",
  "recap.totalRow": "Total",
  "recap.studentsCol": "Siswa",
  "recap.emptyTitle": "Belum ada data",
  "recap.emptyWeekly": "Belum ada absensi pada minggu ini.",
  "recap.emptyMonthly": "Belum ada absensi pada bulan ini.",
  "recap.emptySemester": "Belum ada absensi pada semester ini.",
  "student.quotaTitle": "Kuota siswa",
  "student.quotaUsage": "{used} dari {max} siswa aktif",
  "student.quotaLimit":
    "Kuota siswa sudah penuh. Naik ke paket Pro untuk menambahkan siswa lagi.",
  "student.quotaPro": "{count} siswa aktif · tanpa batas kuota",
  "student.fullName": "Nama lengkap",
  "student.number": "Nomor Induk Siswa atau nomor siswa (opsional)",
  "student.nameRequired": "Nama siswa wajib diisi.",
  "student.classLabel": "Kelas {name}",
  "student.deleteTitle": "Hapus siswa?",
  "student.deleteBody":
    "Siswa akan dinonaktifkan dan tidak dihitung dalam kuota aktif.",
  "student.deleteAction": "Hapus siswa",
  "about.title": "Tentang Absendik",
  "about.subtitle": "Absensi & nilai per kelas atau mapel — dari HP guru.",
  "about.whatIs": "Apa ini?",
  "about.whatIsBody":
    "Catat kehadiran, nilai, dan rekap per kelas atau mata pelajaran — mandiri di HP atau terhubung ke sekolah.",
  "about.howToUse": "Langkah awal",
  "about.step1": "Pilih atau buat sekolah di awal",
  "about.step2": "Tab Pengelolaan: kelas, mapel, dan siswa",
  "about.step3": "Tab Beranda: absensi & nilai harian per kelas",
  "about.step4": "Rekap mingguan/bulanan dan unduh Excel",
  "about.featuresTitle": "Fitur lain",
  "about.featureGrades":
    "Input nilai per tugas, rekap nilai, filter predikat, unduh Excel.",
  "about.featurePredikat":
    "Sekolah mandiri: atur label & ambang predikat di Pengaturan → Predikat nilai.",
  "about.featureSchoolLink":
    "Terhubung Absendik Sekolah — kelas & siswa dari admin; Anda fokus absensi dan nilai.",
  "about.featureCloud":
    "Pro: cadangkan data ke cloud dan pulihkan ke HP lain lewat Pengaturan → Cadangan online.",
  "about.plansHint":
    "Perbandingan paket Gratis dan Pro ada di Pengaturan → Paket dan langganan.",
  "about.schoolHint":
    "Sekolah pakai Absendik Sekolah? Admin kelola data terpusat; guru bergabung lewat tautan undangan.",
  "about.footer": "Absendik Guru",
  "settings.title": "Pengaturan",
  "settings.appearance": "Tampilan",
  "settings.language": "Bahasa",
  "settings.languageId": "Indonesia",
  "settings.languageEn": "English",
  "settings.darkMode": "Mode gelap",
  "settings.darkModeLight": "Terang",
  "settings.darkModeDark": "Gelap",
  "settings.darkModeAuto": "Otomatis",
  "settings.fontSize": "Ukuran teks",
  "settings.fontSizeStandard": "Standar",
  "settings.fontSizeLarge": "Besar",
  "settings.fontSizeHint":
    "Besar memperjelas teks di daftar, form, dan rekap — tampilan tetap rapi.",
  "settings.haptics": "Getaran ketuk",
  "settings.hapticsHint": "Getaran ringan saat menekan tombol.",
  "settings.teachReminders": "Pengingat mengajar",
  "settings.teachRemindersHint": "Notifikasi 10 menit sebelum kelas.",
  "settings.account": "Akun",
  "settings.about": "Tentang Absendik",
  "settings.aboutSub": "Panduan aplikasi",
  "settings.switchSchoolProSub": "Ganti sekolah atau tambah sekolah baru",
  "settings.modulesSection": "Modul fitur",
  "settings.gradePredikatSection": "Nilai",
  "settings.gradePredikat": "Predikat nilai",
  "settings.gradePredikatSub": "Label dan ambang batas predikat rekap",
  "settings.helpSection": "Bantuan",
  "settings.moduleAttendance": "Absensi",
  "settings.moduleGrades": "Penilaian",
  "settings.modulesHint":
    "Pengaturan per sekolah, disimpan di perangkat ini. Minimal satu modul harus aktif.",
  "settings.modulesMinOne":
    "Minimal satu modul (Absensi atau Penilaian) harus aktif.",
  "settings.package": "Paket dan langganan",
  "settings.packageIntro":
    "Semua paket menyimpan data harian di HP Anda. Pro menambah cadangan online dan fitur lanjutan.",
  "settings.freePlanLead":
    "Paket Gratis: 1 sekolah, 5 kelas, hingga 120 siswa aktif, rekap mingguan dan bulanan, ada iklan.",
  "settings.freePlanBadge": "Gratis",
  "settings.freeIncludesTitle": "Paket Gratis — termasuk:",
  "settings.proPlanLead":
    "Pro aktif — sekolah mandiri tanpa batas di HP (selain Absendik Sekolah), kelas tanpa batas per sekolah, siswa tanpa batas, rekap semester, cadangan online, tanpa iklan.",
  "settings.proUnlockTitle": "Naik ke Pro membuka:",
  "settings.proIncludesTitle": "Pro — termasuk:",
  "settings.proUpgradeHint":
    "Bayar lewat Google Play. Satu akun Pro aktif di satu HP — pindahkan di Pengaturan saat ganti perangkat.",
  "settings.proDevUnlockHint":
    "Mode uji: Pro aktif untuk pengembangan aplikasi.",
  "settings.subscribeAlertTitle": "Naik ke Pro",
  "settings.subscribeAlertBody":
    "Data harian tetap di HP Anda. Pro menambah:\n\n• Sekolah mandiri tanpa batas (selain Absendik Sekolah)\n• Kelas tanpa batas per sekolah · mapel tanpa batas\n• Siswa tanpa batas\n• Rekap semester\n• Cadangan online dan sinkron otomatis\n• Pulihkan data saat ganti HP (pindah perangkat di Pengaturan)\n• Tanpa iklan\n\nLanjut ke Google Play?",
  "settings.subscribeAlertBodyAndroid":
    "Data harian tetap di HP Anda. Pro menambah sekolah mandiri tanpa batas, kelas tanpa batas per sekolah, siswa tanpa batas, rekap semester, cadangan online, dan tanpa iklan.\n\n{price}\n\nLanjut ke Google Play?",
  "settings.restorePurchase": "Pulihkan pembelian",
  "settings.iapUnavailable":
    "Langganan Pro hanya tersedia di aplikasi resmi dari Google Play.",
  "settings.iapIosSoon": "Langganan Pro via App Store menyusul.",
  "settings.proPrice": "Harga: {price}",
  "settings.signOut": "Keluar",
  "settings.signOutConfirm": "Keluar dari akun?",
  "settings.freeDesc":
    "1 sekolah · 5 kelas · hingga 120 siswa · rekap mingguan dan bulanan · unduh Excel · ada iklan",
  "settings.proDesc":
    "Sekolah mandiri tanpa batas · kelas tanpa batas per sekolah · siswa tanpa batas · rekap semester · cadangan online · tanpa iklan",
  "settings.upgradePro": "Naik ke Pro",
  "settings.proActive": "Pro aktif",
  "settings.proDeviceConflict": "Pro terdaftar di perangkat lain",
  "settings.proDeviceConflictBody":
    "Langganan Pro aktif di {device}. Pindahkan ke HP ini jika Anda yang memakai akun ini.",
  "settings.proDeviceUnknown": "perangkat lain",
  "settings.transferDevice": "Pindahkan ke HP ini",
  "settings.transferDeviceConfirm":
    "Pro akan aktif di HP ini dan nonaktif di perangkat lama untuk cadangan online. Lanjut?",
  "settings.transferDeviceSuccess": "Pro dipindahkan ke HP ini.",
  "settings.cloud": "Cadangan online",
  "settings.cloudIntro":
    "Khusus Pro: salin data dari HP ke cadangan online, lalu pulihkan saat ganti HP.",
  "settings.sync": "Cadangkan sekarang",
  "settings.syncDesc":
    "Unggah sekolah, kelas, siswa, absensi, dan nilai dari HP ini.",
  "settings.restore": "Pulihkan cadangan",
  "settings.restoreDesc":
    "Ganti isi HP dengan cadangan terakhir. Data di HP saat ini akan diganti.",
  "settings.cloudHint": "Cadangan online hanya tersedia di paket Pro.",
  "settings.autoCloudSync": "Cadangkan otomatis",
  "settings.autoCloudSyncHint":
    "Data di HP dicadangkan secara berkala (saat aplikasi aktif dan setelah perubahan). Aktif otomatis untuk Pro.",
  "workspace.badgeSchool": "Absendik Sekolah",
  "workspace.badgeLocal": "Di HP",
  "workspace.badgeLocalArchive": "Arsip sebelum terhubung",
  "workspace.localArchiveHint":
    "Data lama dengan nama sama sekolah tetap ada di sini — buka untuk rekap dan unduh Excel. Absensi baru lewat Absendik Sekolah.",
  "workspace.localArchiveBanner":
    "Arsip data sebelum terhubung ke sekolah. Rekap dan unduh Excel masih bisa dipakai; absensi baru lewat Absendik Sekolah.",
  "workspace.openLocalArchive": "Arsip lokal di HP",
  "workspace.openLocalArchiveBody":
    "{count} sekolah · data lama sebelum terhubung ke Absendik Sekolah",
  "workspace.localArchiveScreenTitle": "Arsip lokal di HP",
  "workspace.localArchiveScreenHint":
    "Data lama di HP sebelum terhubung ke sekolah. Rekap dan unduh Excel masih bisa dipakai; absensi baru lewat Absendik Sekolah.",
  "workspace.localArchiveCount": "{count} arsip tersedia",
  "workspace.localArchiveEmptyTitle": "Tidak ada arsip",
  "workspace.localArchiveEmptyBody":
    "Arsip muncul jika pernah input di HP lalu terhubung ke Absendik Sekolah dengan nama yang sama.",
  "createWorkspace.linkedSchoolExists":
    "Anda sudah terhubung ke sekolah ini lewat Absendik Sekolah. Pilih sekolah berlabel Absendik Sekolah, bukan menambah sekolah baru di HP.",
  "settings.danger": "Zona berbahaya",
  "settings.wipe": "Hapus data di HP",
  "settings.wipeHint":
    "Menghapus kelas, siswa, absensi, dan nilai di HP ini. Akun Anda tidak ikut terhapus.",
  "settings.dataHint":
    "Data absensi dan nilai tersimpan di HP ini. Pro menambah cadangan online.",
  "settings.adPrivacy": "Privasi iklan",
  "settings.adPrivacySub": "Atur izin iklan dan preferensi privasi Anda.",
  "pkg.free.school": "1 sekolah",
  "pkg.free.students": "120 siswa",
  "pkg.free.classes": "5 kelas · mapel tanpa batas",
  "pkg.free.recap": "Rekap mingguan dan bulanan",
  "pkg.free.excel": "Unduh Excel",
  "pkg.free.local": "Data di HP",
  "pkg.free.ads": "Ada iklan",
  "pkg.pro.school": "Sekolah mandiri tanpa batas",
  "pkg.pro.classes": "Kelas tanpa batas per sekolah · mapel tanpa batas",
  "pkg.pro.students": "Siswa tanpa batas",
  "pkg.pro.semester": "Rekap semester",
  "pkg.pro.cloud": "Cadangan online",
  "pkg.pro.sync": "Pindah perangkat di Pengaturan",
  "pkg.pro.restore": "Pulihkan saat ganti HP",
  "pkg.pro.noads": "Tanpa iklan",
  "nav.tabHome": "Beranda",
  "nav.tabClasses": "Kelas",
  "nav.tabRecap": "Rekap absensi",
  "nav.tabAccount": "Akun",
  "nav.tabManage": "Pengelolaan",
  "nav.tabSettings": "Pengaturan",
  "nav.tabManageClasses": "Kelas",
  "nav.tabManageSubjects": "Mapel",
  "nav.tabManageStudents": "Siswa",
  "nav.greeting": "Halo, {name}. Siap mengajar hari ini?",
  "nav.quickActions": "Akses cepat",
  "nav.recentClasses": "Kelas terbaru",
  "nav.statClasses": "Kelas",
  "nav.statStudents": "Siswa",
  "nav.statSubjects": "Mata pelajaran",
  "nav.switchSchool": "Ganti sekolah",
  "nav.switchSchoolSub": "Pilih lembaga lain tempat Anda mengajar",
  "nav.emptyHomeTitle": "Belum ada kelas",
  "nav.emptyHomeBody": "Mulai dengan menambahkan kelas pertama Anda.",
  "nav.classListTitle": "Daftar kelas",
  "nav.classListBodyClass": "Pilih kelas untuk mengisi absensi hari ini.",
  "nav.classListBodySubject":
    "Pilih kelas, lalu pilih mata pelajaran untuk absensi atau nilai.",
  "nav.openClass": "Buka kelas",
  "nav.classActions": "Fitur kelas",
  "nav.attendanceToday": "Absensi hari ini",
  "nav.attendance": "Absensi",
  "nav.students": "Daftar siswa",
  "nav.recap": "Rekap absensi",
  "nav.grades": "Isi nilai",
  "nav.gradeRecap": "Rekap nilai",
  "nav.manageClass": "Kelola kelas",
  "nav.manageSubject": "Kelola mata pelajaran",
  "nav.subjectsSection": "Mata pelajaran",
  "nav.addSubject": "Tambah mata pelajaran",
  "nav.editSubject": "Ubah mata pelajaran",
  "nav.editStudent": "Ubah siswa",
  "nav.modeClass": "Absensi per kelas",
  "nav.noChanges": "Tidak ada perubahan.",
  "nav.subjectSaved": "Mata pelajaran disimpan.",
  "nav.recapTitle": "Rekap kehadiran",
  "nav.recapBody":
    "Pilih kelas untuk melihat rekap mingguan, bulanan, atau semester.",
  "nav.viewRecap": "Lihat rekap",
  "nav.accountSection": "Profil dan aplikasi",
  "nav.schoolSection": "Sekolah",
  "nav.sessionSection": "Sesi",
  "nav.guide": "Panduan penggunaan",
  "nav.guideSub": "Ulangi panduan fitur aplikasi",
  "nav.allClasses": "Semua kelas",
  "classPicker.subjects": "Pilih kelas untuk mengelola mata pelajarannya.",
  "classPicker.students": "Pilih kelas untuk mengelola daftar siswanya.",
  "classPicker.tapToOpen": "Buka kelas",
  "manage.hubHint":
    "Kelola data kelas, mata pelajaran, dan siswa di sini. Absensi dan penilaian ada di tab Beranda.",
  "manage.hubClasses": "Kelas",
  "manage.hubClassesSub": "Tambah, ubah, atau hapus kelas",
  "manage.hubSubjects": "Mata pelajaran",
  "manage.hubSubjectsSub": "Kelola mapel per kelas",
  "manage.hubStudents": "Siswa",
  "manage.hubStudentsSub": "Kelola daftar siswa per kelas",
  "home.hubHint": "Pilih modul yang ingin Anda gunakan.",
  "home.hubAttendanceSub": "Isi absensi harian per kelas atau mata pelajaran",
  "home.hubGradesSub": "Input nilai tugas dan lihat rekap penilaian",
  "home.noModulesHint":
    "Belum ada modul aktif. Aktifkan Absensi atau Penilaian di tab Pengaturan.",
  "home.tapClassForAttendance": "Isi absensi kelas ini",
  "home.tapClassForGrades": "Isi nilai kelas ini",
  "home.tapClassPickModule": "Absensi & penilaian",
  "home.openManageSub": "Kelas, mata pelajaran, dan siswa",
  "home.classModuleHint": "Pilih modul untuk kelas ini.",
  "home.classesHint": "Ketuk kelas untuk absensi atau penilaian.",
  "home.classesSubjectHint":
    "Ketuk kelas untuk memilih mata pelajaran, lalu absensi atau penilaian.",
  "home.classesAttendanceHint": "Ketuk kelas untuk mengisi absensi.",
  "home.classesSubjectAttendanceHint":
    "Ketuk kelas, pilih mata pelajaran, lalu isi absensi.",
  "home.classesGradesHint": "Ketuk kelas untuk mengisi nilai.",
  "home.classesSubjectGradesHint":
    "Ketuk kelas, pilih mata pelajaran, lalu isi nilai.",
  "home.moduleClassesAttendanceHint":
    "Pilih kelas untuk mengisi absensi hari ini.",
  "home.moduleClassesGradesHint": "Pilih kelas untuk menginput nilai.",
  "home.moduleClassesSubjectAttendanceHint":
    "Pilih kelas, lalu pilih mata pelajaran untuk absensi.",
  "home.moduleClassesSubjectGradesHint":
    "Pilih kelas, lalu pilih mata pelajaran untuk nilai.",
  "home.moduleSubjectAttendanceHint":
    "Ketuk mata pelajaran untuk mengisi absensi.",
  "home.moduleSubjectGradesHint": "Ketuk mata pelajaran untuk input nilai.",
  "home.tapSubjectForAttendance": "Isi absensi mapel ini",
  "home.tapSubjectForGrades": "Isi nilai mapel ini",
  "modules.attendance": "Absensi",
  "modules.grades": "Penilaian",
  "common.optional": "Opsional",
  "common.loginFailed": "Gagal masuk.",
  "common.menu": "Menu",
  "workspace.pickSchool": "Pilih sekolah",
  "workspace.addSchool": "Tambah sekolah",
  "workspace.emptyTitle": "Belum ada sekolah",
  "workspace.emptyBody": "Tambahkan sekolah pertama untuk mulai mengajar.",
  "workspace.notLinkedSchoolHint":
    "Akun ini belum terhubung ke Absendik Sekolah. Keluar, lalu masuk dengan email & kata sandi yang admin sekolah buat — bukan login Google terpisah.",
  "workspace.manualPickHint":
    "Akun terhubung ke Absendik Sekolah di bawah. Untuk sekolah mandiri di HP, ketuk Tambah sekolah. Arsip lokal lama ada di menu bawah jika pernah dipakai.",
  "workspace.freeLimitTitle": "Kuota sekolah terpenuhi",
  "workspace.freeLimitBody":
    "Paket gratis hanya mendukung 1 sekolah mandiri di HP (selain Absendik Sekolah). Kuota Anda sudah penuh. Ingin naik ke Pro untuk menambah sekolah mandiri tanpa batas?",
  "bootstrap.retry": "Coba lagi",
  "bootstrap.signOut": "Keluar dari akun",
  "bootstrap.profileLoadFailed": "Tidak bisa memuat profil.",
  "bootstrap.networkHint": " Periksa koneksi internet lalu coba lagi.",
  "bootstrap.sessionLoadFailed": "Gagal memuat sesi. Coba buka ulang aplikasi.",
  "onboarding.welcomeNav": "Selamat datang",
  "onboarding.skip": "Lewati",
  "onboarding.next": "Lanjut",
  "onboarding.start": "Mulai pakai aplikasi",
  "onboarding.stepA11y": "Langkah {step}",
  "onboarding.welcome.title": "Selamat datang di Absendik Guru",
  "onboarding.welcome.body":
    "Catat absensi, nilai tugas, dan rekap — per kelas atau per mata pelajaran, langsung dari HP Anda.",
  "onboarding.storage.title": "Data tersimpan di HP Anda",
  "onboarding.storage.body":
    "Kelas, siswa, absensi, dan nilai disimpan di HP. Pencatatan harian tetap bisa tanpa internet. Paket Pro menambah cadangan online.",
  "onboarding.storage.bullet1":
    "Gratis: 1 sekolah, 5 kelas, 120 siswa, rekap mingguan/bulanan, unduh Excel, ada iklan",
  "onboarding.storage.bullet2":
    "Pro: sekolah mandiri tanpa batas, kelas tanpa batas per sekolah, siswa tanpa batas, rekap semester, cadangan online, tanpa iklan",
  "onboarding.school.title": "Sekolah mandiri di HP",
  "onboarding.school.body":
    "Buat sekolah/workspace sendiri jika belum terhubung ke Absendik Sekolah. Gratis: 1 sekolah; Pro: sekolah mandiri tanpa batas (selain Absendik Sekolah).",
  "onboarding.school.bullet1":
    "Atur cara absensi: per kelas atau per mata pelajaran",
  "onboarding.school.bullet2":
    "Gratis: 5 kelas per sekolah · Pro: kelas tanpa batas per sekolah · mapel tanpa batas",
  "onboarding.schoolLink.title": "Terhubung Absendik Sekolah",
  "onboarding.schoolLink.body":
    "Jika sekolah memakai Absendik Sekolah, kelas dan siswa sudah disiapkan admin — tidak perlu input ulang.",
  "onboarding.schoolLink.bullet1":
    "Gabung lewat tautan undangan dari Absendik Sekolah",
  "onboarding.schoolLink.bullet2":
    "Pilih workspace berlabel Absendik Sekolah untuk absensi & nilai harian",
  "onboarding.schoolLink.bullet3":
    "Penambahan kelas/siswa tetap lewat admin sekolah, bukan di app guru",
  "onboarding.class.title": "Kelas & siswa",
  "onboarding.class.body":
    "Kelola kelas & siswa di tab Pengelolaan; absensi dan nilai harian di tab Beranda.",
  "onboarding.class.bullet1":
    "Tab Pengelolaan → kelas, mata pelajaran, dan daftar siswa",
  "onboarding.class.bullet2":
    "Tab Beranda → pilih kelas → modul Absensi atau Nilai",
  "onboarding.class.bullet3":
    "Mode absensi per kelas atau per mata pelajaran diatur saat buat sekolah",
  "onboarding.attendance.title": "Absensi harian",
  "onboarding.attendance.body":
    "Langkah yang paling sering Anda lakukan setiap hari.",
  "onboarding.attendance.bullet1":
    "Beranda → Absensi → pilih kelas (dan mapel jika mode per mapel)",
  "onboarding.attendance.bullet2":
    "Status awal kosong; pilih Hadir/Sakit/Izin/Alpha atau tap Set semua hadir",
  "onboarding.attendance.bullet3":
    "Menu ⋮ di header: rekap absensi, daftar siswa, kelola kelas",
  "onboarding.grades.title": "Nilai tugas",
  "onboarding.grades.body":
    "Catat nilai ulangan, PR, atau tugas lain per kelas atau mapel.",
  "onboarding.grades.bullet1":
    "Beranda → Nilai → pilih kelas (dan mapel jika per mapel)",
  "onboarding.grades.bullet2":
    "Tambah tugas, isi nilai tiap siswa di kolom kanan, lalu Simpan",
  "onboarding.grades.bullet3":
    "Menu ⋮ → Rekap nilai; sekolah mandiri bisa atur predikat di Pengaturan",
  "onboarding.more.title": "Rekap & cadangan",
  "onboarding.more.body":
    "Setelah data terisi, buka rekap untuk administrasi. Pro bisa cadangkan ke cloud.",
  "onboarding.more.bullet1":
    "Rekap absensi & nilai: mingguan/bulanan (Gratis & Pro), filter & cari siswa",
  "onboarding.more.bullet2": "Rekap semester (Pro)",
  "onboarding.more.bullet3": "Unduh laporan ke Excel dari layar rekap",
  "onboarding.more.bullet4":
    "Pengaturan: modul fitur, predikat nilai, Pro, cadangan online, pengingat jadwal",
  "onboarding.startStep.title": "Siap memulai",
  "onboarding.startStep.body":
    "Mulai dengan menambah sekolah mandiri atau gabung ke Absendik Sekolah.",
  "onboarding.startStep.bullet1":
    "Data harian di HP; cadangan cloud hanya jika Anda aktifkan (Pro)",
  "createWorkspace.nameRequired": "Nama sekolah wajib diisi.",
  "createWorkspace.levelRequired": "Jenjang wajib dipilih.",
  "createWorkspace.cityRequired": "Kota wajib diisi.",
  "createWorkspace.hint":
    "Paket gratis: 1 sekolah mandiri, 5 kelas. Pro: sekolah mandiri tanpa batas (selain Absendik Sekolah), kelas tanpa batas per sekolah.",
  "createWorkspace.nameLabel": "Nama sekolah *",
  "createWorkspace.namePlaceholder": "SMP Negeri 1 Bandung",
  "createWorkspace.levelLabel": "Jenjang *",
  "createWorkspace.cityLabel": "Kota *",
  "createWorkspace.cityPlaceholder": "Bandung",
  "createWorkspace.showExtra": "Lengkapi detail sekolah (opsional)",
  "createWorkspace.hideExtra": "Sembunyikan detail sekolah",
  "createWorkspace.npsn": "NPSN",
  "createWorkspace.province": "Provinsi",
  "createWorkspace.address": "Alamat",
  "createWorkspace.pic": "Penanggung jawab",
  "createWorkspace.phone": "Telepon / WhatsApp",
  "createWorkspace.email": "Email",
  "createWorkspace.attendanceSection": "Absensi",
  "createWorkspace.modeSubject": "Per mata pelajaran",
  "quota.unlimitedSchools": "Sekolah tanpa batas",
  "quota.schoolCount": "{count} sekolah",
  "quota.unlimitedStudents": "siswa tanpa batas",
  "quota.studentLimit": "hingga {count} siswa",
  "quota.unlimitedClassesPerSchool": "kelas tanpa batas",
  "quota.classLimitPerSchool": "hingga {count} kelas",
  "quota.unlimitedSubjects": "mapel tanpa batas",
  "quota.classesSubjects": "kelas & mata pelajaran tanpa batas",
  "settings.proActivateFailed": "Gagal mengaktifkan Pro.",
  "menu.settings": "Pengaturan",
  "menu.switchSchool": "Ganti sekolah",
  "menu.signOut": "Keluar dari akun",
  "classMenu.weeklyRecap": "Rekap mingguan",
  "classMenu.editOrDelete": "Ubah atau hapus kelas",
  "ads.sponsorTitle": "Dukungan sponsor",
  "ads.placement.attendanceSaved":
    "Absensi tersimpan. Terima kasih sudah memakai Absendik Gratis.",
  "ads.placement.gradeSaved":
    "Nilai tersimpan. Terima kasih sudah memakai Absendik Gratis.",
  "ads.placement.recapExport":
    "Unduh rekap berhasil. Terima kasih sudah memakai Absendik Gratis.",
  "ads.placement.syncComplete":
    "Cadangan selesai. Terima kasih sudah memakai Absendik Gratis.",
  "ads.placement.default": "Terima kasih sudah memakai Absendik Gratis.",
  "ads.mockLabel": "Ruang iklan",
  "ads.mockSub":
    "Iklan jarang ditampilkan dan tidak muncul saat mengisi absensi atau nilai.",
  "ads.continue": "Lanjut",
  "ads.upgradeProNoAds": "Pro · tanpa iklan",
  "ads.bannerHint": "Dukungan iklan membantu Absendik Guru tetap gratis.",
  "ads.upgradeShort": "Pro · tanpa iklan",
  "export.shareRecap": "Unduh rekap Excel",
  "export.shareGradeRecap": "Unduh rekap nilai Excel",
  "export.shareGradeHistory": "Unduh riwayat nilai Excel",
  "export.noData": "Tidak ada data untuk diunduh.",
  "export.semesterRecapPro":
    "Unduh rekap semester tersedia untuk pelanggan Pro.",
  "export.semesterGradePro":
    "Unduh nilai semester tersedia untuk pelanggan Pro.",
  "export.loadRecapFirst":
    "Muat rekap terlebih dahulu, lalu unduh dari layar rekap.",
  "export.createFileFailed": "Gagal membuat file Excel.",
  "export.shareUnsupported": "Berbagi file tidak didukung di HP ini.",
  "export.confirmTitle": "Unduh Excel",
  "export.confirmMessage":
    "File Excel akan dibuat dan bisa dibagikan atau disimpan lewat menu sistem.",
  "export.confirmMessageAndroid":
    "File Excel akan dibuat. Anda bisa menyimpannya ke Penyimpanan, Drive, atau aplikasi lain lewat menu bagikan. Izin penyimpanan diminta jika diperlukan.",
  "export.confirmContinue": "Lanjut unduh",
  "export.exportCancelled": "Unduhan dibatalkan.",
  "export.storagePermissionTitle": "Akses penyimpanan",
  "export.storagePermissionMessage":
    "Absendik Guru perlu izin menyimpan file Excel ke penyimpanan perangkat Anda.",
  "export.storagePermissionDenied":
    "Izin penyimpanan ditolak. Anda masih bisa mencoba lewat menu bagikan setelah file dibuat.",
  "student.quotaAtMax":
    "Maksimal {max} siswa. Naik ke Pro untuk menambah siswa.",
  "error.notSignedIn": "Belum login.",
  "error.noServerResponse":
    "Server tidak merespons. Periksa koneksi internet lalu coba lagi.",
  "error.serverInvalidResponse":
    "Server merespons tidak valid. Coba lagi atau perbarui aplikasi.",
  "error.connectionFailed":
    "Tidak bisa terhubung ke server. Periksa koneksi internet lalu coba lagi.",
  "error.requestFailed": "Permintaan gagal.",
  "error.schoolClassesLoadFailed":
    "Gagal memuat kelas dari Absendik Sekolah. Tarik layar ke bawah untuk refresh.",
  "error.schoolGradesLoadFailed":
    "Gagal memuat nilai dari Absendik Sekolah. Tarik layar ke bawah untuk refresh.",
  "error.schoolGradesSaveFailed":
    "Gagal menyimpan nilai. Periksa koneksi lalu coba lagi.",
  "error.schoolGradeRecapLoadFailed":
    "Gagal memuat rekap nilai. Tarik layar ke bawah untuk refresh.",
  "error.generic": "Terjadi kesalahan. Coba lagi.",
  "cloud.needPro":
    "Aktifkan langganan Pro dulu untuk mencadangkan data online.",
  "cloud.nothingToBackup": "Tidak ada data di HP untuk dicadangkan.",
  "cloud.needProRestore":
    "Aktifkan langganan Pro dulu untuk memulihkan cadangan.",
  "cloud.noBackupYet":
    "Belum ada cadangan online. Cadangkan data dari HP lama terlebih dahulu.",
  "local.dbOpenFailed": "Data di HP gagal dibuka. Coba buka ulang aplikasi.",
  "local.freeSchoolLimit":
    "Paket gratis hanya mendukung 1 sekolah mandiri di HP. Naik ke Pro untuk sekolah mandiri tanpa batas (selain Absendik Sekolah).",
  "local.classLimitBody":
    "Kuota kelas penuh untuk sekolah ini (maks. {max} kelas). Naik ke Pro untuk limit lebih besar.",
  "cloud.restoreFailed": "Gagal memulihkan cadangan.",
  "iap.purchaseInProgress": "Pembelian masih diproses.",
  "workspace.schoolQuotaFull":
    "Kuota sekolah mandiri penuh (maks. {max} sekolah, tidak termasuk Absendik Sekolah).",
  "iap.cancelled": "Pembelian dibatalkan.",
  "iap.purchaseFailed": "Pembelian gagal.",
  "iap.tokenMissing": "Token pembelian tidak ditemukan.",
  "iap.noActiveSubscription":
    "Tidak ada langganan Pro aktif di akun Google Play ini.",
  "iap.openPlayFailed": "Tidak bisa membuka Google Play.",
  "iap.restoreFailed": "Gagal memulihkan pembelian.",
};

const en: Record<TranslationKey, string> = {
  "app.name": "Absendik Guru",
  "app.tagline": "Attendance & grades per class or subject — in your pocket",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.done": "Done",
  "common.back": "Back",
  "common.or": "or",
  "common.loading": "Loading…",
  "common.students": "students",
  "common.class": "Class",
  "common.school": "School",
  "login.heroSubtitle":
    "Daily attendance, grades, and class reports — right from your phone.",
  "login.welcomeTitle": "Hello, Teacher!",
  "login.welcomeSub": "Sign in once and manage your classes on the go.",
  "login.featureAttendance": "Attendance",
  "login.featureGrades": "Grades",
  "login.featureRecap": "Reports",
  "login.google": "Sign in with Google",
  "login.googleHint": "Fastest way — use your existing Google account",
  "login.googleProviderDisabled":
    "Google sign-in is not available. Use email and password, or contact your school admin.",
  "login.googleCallbackFailed":
    "Google sign-in did not finish. Try again or use email and password.",
  "login.googleLocalhostRedirect":
    "Google sign-in could not return to the app. Try again with a stable connection.",
  "login.googleOAuthWebOrigin":
    "OAuth web origin is misconfigured. Set EXPO_PUBLIC_OAUTH_WEB_ORIGIN=https://demo.absendik.id (public HTTPS, not a local IP).",
  "login.googleOAuthTimeout":
    "Google sign-in took too long. Try again or use email and password.",
  "login.googleOAuthCancelled": "Google sign-in was cancelled.",
  "login.googleSignInFailed":
    "Google sign-in failed. Try again or use email and password.",
  "login.googleRedirectUriMismatch":
    "Google sign-in is not configured. Ask an admin to add the Supabase redirect URI in Google Cloud Console.",
  "login.googleCloudSetupTitle": "Dev — Google Cloud Authorized redirect URI:",
  "login.googleCloudSetupHint":
    "Web application OAuth client. Use the same Client ID/Secret in Supabase → Providers → Google.",
  "login.googleSimulatorHint":
    "Developer mode: copy the redirect URL to server settings if Google sign-in fails.",
  "login.googleExpoGoSetupTitle": "Dev — Supabase Redirect URLs (fixed):",
  "login.googleExpoGoSessionTitle": "This session redirect (automatic):",
  "login.googleExpoGoSetupHint":
    "Set EXPO_PUBLIC_OAUTH_WEB_ORIGIN = Supabase Site URL. After Google login, the web page forwards back to Expo Go.",
  "login.emailToggle": "Email & password",
  "login.emailHide": "Close",
  "login.email": "Email",
  "login.password": "Password",
  "login.emailSubmit": "Sign in",
  "login.emailHint": "Use the email connected to Absendik Sekolah.",
  "login.schoolLinkHint":
    "Absendik Guru helps with attendance and grades — per homeroom or per subject. Your time is better spent teaching than on admin work.",
  "classes.hintTitle": "Start from a class",
  "classes.hintBodyClass":
    "Use the attendance or grades button on each class. The other menu button opens students, reports, and class settings.",
  "classes.hintBodySubject":
    "Choose a class first, then choose a subject for attendance or grades.",
  "classes.tapToAttendance": "Take attendance",
  "classes.tapToSubjects": "Choose subject",
  "classes.tapToSubjectsGrades": "Subjects & grades",
  "classes.empty": "No classes yet. Tap + to add your first class.",
  "classes.emptySchool":
    "No classes assigned to you yet. Ask your school admin to assign classes/subjects in Absendik Sekolah.",
  "classes.hintBodySchool":
    "Classes and students come from Absendik Sekolah. You can take attendance and enter grades; adding classes/students is done by the school admin.",
  "classes.addClass": "Add class",
  "classes.addClassHint": "Examples: VII-A, VIII-B, Tahfidz group.",
  "classes.manageHint":
    "Manage your class list. Tap a class to edit or delete it.",
  "classes.tapToManage": "Manage class",
  "classes.emptyHome":
    "No classes yet. Tap Manage above to add your first class.",
  "subjects.tapToManage": "Manage subject",
  "subjects.hintTitle": "Choose a subject",
  "subjects.hintBody":
    "Students icon (top right) opens the student list; book icon adds a subject. You can also tap the student count above.",
  "subjects.hintBodyGrades":
    "Students icon opens the student list; book icon adds a subject. Tap a subject to enter grades.",
  "subjects.hintBodyBoth":
    "Students icon opens the student list; book icon adds a subject. Use the attendance or grades icon on each subject.",
  "subjects.tapToAttendance": "Take attendance",
  "subjects.empty": "No subjects yet. Tap + at the top right to add one.",
  "subjects.noStudents": "No students in this class yet.",
  "subjects.addStudent": "Add student",
  "subjects.manageHint":
    "Manage subjects for this class. Tap a subject to edit or delete it.",
  "attendance.today": "Today",
  "attendance.hint":
    "Choose Present, Sick, Excused, or Absent. Tap a name for history, or the note icon for remarks.",
  "attendance.saved": "Attendance saved",
  "attendance.save": "Save attendance",
  "attendance.edit": "Edit attendance",
  "attendance.editHint": "Change statuses, then tap Save.",
  "attendance.readOnlyHint":
    "Attendance for this date is saved. Tap Edit attendance below to make changes.",
  "attendance.editingHint": "Change statuses, then tap Save attendance.",
  "attendance.noStudents": "No students in this class yet.",
  "attendance.addStudent": "Add student",
  "attendance.notePlaceholder": "Note (optional)",
  "attendance.noteToggle": "Note",
  "attendance.noteHide": "Hide",
  "attendance.tapStudentDetail": "Tap to view attendance history",
  "attendance.pickDateHint": "Tap the date to pick another day",
  "datePicker.title": "Pick a date",
  "attendance.notFuture": "Cannot record attendance for a future date.",
  "attendance.goToday": "Go to today",
  "attendance.setAllPresent": "Mark all present",
  "attendance.incompleteStatus":
    "Choose attendance status for every student first.",
  "grades.hint":
    "A day can have multiple tasks. Open a task to set its title and student scores.",
  "grades.addTask": "Add task",
  "grades.noTasks": "No tasks on this date yet. Add a task to enter grades.",
  "grades.titlePlaceholder": "Task title (e.g. Quiz Ch. 2)",
  "grades.titleLabel": "Task title",
  "grades.studentColumnLabel": "Student name",
  "grades.scoreColumnLabel": "Score",
  "grades.scorePlaceholder": "0–100",
  "grades.titleRequired": "Task title is required.",
  "grades.saved": "Task grades saved",
  "grades.taskAdded": "New task added",
  "grades.edit": "Edit grades",
  "grades.readOnlyHint":
    "Grades are saved. Open a task to review, or tap Edit grades to change them.",
  "grades.editingHint": "Change the title or scores, then tap Save.",
  "grades.scoreFilled": "{filled}/{total} scores",
  "grades.deleteTitle": "Delete task?",
  "grades.deleteBody": 'Task "{title}" and its scores will be deleted.',
  "grades.deleteAction": "Delete task",
  "grades.recapEmpty": "No grades recorded for the selected period.",
  "grades.recapTaskCount": "{count} tasks recorded",
  "grades.recapStudentSummary": "{scored} of {total} tasks · avg {average}",
  "grades.recapStudentSummaryNoAvg": "{scored} of {total} tasks",
  "grades.recapTaskFraction": "{scored}/{total} tasks",
  "grades.recapViewList": "List",
  "grades.recapViewTable": "Table",
  "grades.recapMetaSummary": "{students} students · {tasks} scores recorded",
  "gradePredikat.title": "Grade bands",
  "gradePredikat.desc":
    "Set labels and score thresholds for grade recap. Band colors stay the same; you can customize labels and ranges.",
  "gradePredikat.sectionBands": "Band ranges",
  "gradePredikat.labelField": "Label",
  "gradePredikat.minField": "Min",
  "gradePredikat.minAuto": "Auto < Fair",
  "gradePredikat.hint":
    "Thresholds must decrease: Excellent > Good > Fair (1–100). Scores below Fair use the lowest band.",
  "gradePredikat.save": "Save settings",
  "gradePredikat.reset": "Reset to default",
  "gradePredikat.resetConfirm": "Reset bands to default (≥90 / ≥80 / ≥70)?",
  "gradePredikat.saved": "Grade band settings saved.",
  "gradePredikat.schoolReadOnly":
    "Linked to Absendik Sekolah — bands are managed by admin on the web portal.",
  "gradePredikat.tierHighest": "Highest",
  "gradePredikat.tierLowest": "Lowest",
  "grades.listTitle": "Grade list",
  "grades.listSearchPlaceholder": "Search name or student ID",
  "grades.listPredikatLabel": "Band",
  "grades.listPredikatChoose": "Choose band",
  "grades.listFilterAll": "All bands",
  "grades.listFilterRemedial": "Has failing scores (remedial)",
  "grades.listFilterAverageBand": "Average {band}",
  "grades.listFilterToggle": "Search & filter",
  "grades.listShowingCount": "Showing {shown} of {total} students",
  "grades.listEmpty": "No students match the filter.",
  "grades.reload": "Reload",
  "grades.exportExcel": "Download Excel",
  "schedule.title": "Teaching schedule",
  "schedule.hint":
    "Optional. Pick one or more days with the same time. Used for pre-class reminders.",
  "schedule.empty": "No teaching schedule yet. Add one if you want reminders.",
  "schedule.add": "Add slot",
  "schedule.remove": "Remove",
  "schedule.start": "Start",
  "schedule.end": "End",
  "schedule.pickTime": "Pick time",
  "studentDetail.title": "Attendance history",
  "studentDetail.summary": "Summary",
  "studentDetail.history": "Daily records",
  "studentDetail.empty": "No attendance records for this student yet.",
  "studentDetail.records": "{count} days recorded",
  "studentDetail.filteredSubject": "Subject filter: {subject}",
  "studentGradeDetail.title": "Grade history",
  "studentGradeDetail.summary": "Summary",
  "studentGradeDetail.scoredCount": "{count} tasks have scores",
  "studentGradeDetail.history": "Task history",
  "studentGradeDetail.empty": "No task scores recorded for this student yet.",
  "studentGradeDetail.records": "{count} tasks recorded",
  "studentGradeDetail.filteredSubject": "Subject filter: {subject}",
  "studentGradeDetail.exportExcel": "Download Excel",
  "students.hint":
    "Tap the attendance or grade icon to view a student's history. Use ⋯ to edit their profile.",
  "students.hintSchool":
    "Student list from Absendik Sekolah. Adding or editing students is done by the school admin.",
  "students.manageHint":
    "Manage students in this class. Tap a student to edit or delete them.",
  "school.readonlyTitle": "Managed by school admin",
  "school.noStudentsHint":
    "No students in this class yet. Ask your school admin to add students in Absendik Sekolah.",
  "students.empty": "No students yet. Tap + to add a student.",
  "class.nameLabel": "Class name",
  "class.nameRequired": "Class name is required.",
  "class.labelColor": "Label color",
  "class.deleteTitle": "Delete class?",
  "class.deleteBody":
    "The class and all students in it will be deleted. This cannot be undone.",
  "class.deleteAction": "Delete class",
  "subject.nameLabel": "Subject name",
  "subject.nameRequired": "Subject name is required.",
  "subject.deleteTitle": "Delete subject {name}?",
  "subject.deleteBody":
    "The subject and its teaching schedule will be deleted.",
  "subject.deleteAction": "Delete subject",
  "recap.metaSummary": "{students} students · {days} days recorded",
  "recap.periodWeekly": "Weekly",
  "recap.periodMonthly": "Monthly",
  "recap.periodSemester": "Semester",
  "recap.periodLabel": "Period",
  "recap.choosePeriod": "Choose period",
  "recap.segmentWeekly": "Week",
  "recap.segmentMonthly": "Month",
  "recap.segmentSemester": "Semester",
  "recap.needSubject": "Add a subject first to view subject-based reports.",
  "recap.subjectLabel": "Subject",
  "recap.chooseSubject": "Choose subject",
  "recap.pctColumn": "% present",
  "recap.totalRow": "Total",
  "recap.studentsCol": "Students",
  "recap.emptyTitle": "No data yet",
  "recap.emptyWeekly": "No attendance recorded this week.",
  "recap.emptyMonthly": "No attendance recorded this month.",
  "recap.emptySemester": "No attendance recorded this semester.",
  "student.quotaTitle": "Student quota",
  "student.quotaUsage": "{used} of {max} students",
  "student.quotaPro": "{count} students · no limit",
  "student.quotaLimit": "Student limit reached. Go Pro to add more students.",
  "student.fullName": "Full name",
  "student.number": "Student ID (optional)",
  "student.nameRequired": "Student name is required.",
  "student.classLabel": "Class {name}",
  "student.deleteTitle": "Delete student?",
  "student.deleteBody":
    "The student will be deactivated and no longer counts toward your student limit.",
  "student.deleteAction": "Delete student",
  "about.title": "About Absendik",
  "about.subtitle": "Attendance & grades per class or subject — on your phone.",
  "about.whatIs": "What is it?",
  "about.whatIsBody":
    "Track attendance, grades, and reports by class or subject — on your own or linked to a school.",
  "about.howToUse": "Quick start",
  "about.step1": "Pick or create a school first",
  "about.step2": "Manage tab: classes, subjects, and students",
  "about.step3": "Home tab: daily attendance & grades per class",
  "about.step4": "Weekly/monthly reports and Excel download",
  "about.featuresTitle": "More features",
  "about.featureGrades":
    "Task scores, grade reports, band filters, Excel export.",
  "about.featurePredikat":
    "Independent schools: set band labels & thresholds in Settings → Grade bands.",
  "about.featureSchoolLink":
    "Link Absendik Sekolah — classes & students from admin; you focus on attendance and grades.",
  "about.featureCloud":
    "Pro: back up to the cloud and restore on another phone via Settings → Online backup.",
  "about.plansHint":
    "Free vs Pro plan details are in Settings → Plan & subscription.",
  "about.schoolHint":
    "School on Absendik Sekolah? Admins manage centrally; teachers join via invitation link.",
  "about.footer": "Absendik Guru",
  "settings.title": "Settings",
  "settings.appearance": "Appearance",
  "settings.language": "Language",
  "settings.languageId": "Indonesia",
  "settings.languageEn": "English",
  "settings.darkMode": "Dark mode",
  "settings.darkModeLight": "Light",
  "settings.darkModeDark": "Dark",
  "settings.darkModeAuto": "Auto",
  "settings.fontSize": "Text size",
  "settings.fontSizeStandard": "Standard",
  "settings.fontSizeLarge": "Large",
  "settings.fontSizeHint":
    "Large makes lists, forms, and reports easier to read while keeping the layout clean.",
  "settings.haptics": "Tap vibration",
  "settings.hapticsHint": "Light vibration when tapping buttons.",
  "settings.teachReminders": "Teaching reminders",
  "settings.teachRemindersHint": "Notify 10 minutes before class.",
  "settings.account": "Account",
  "settings.about": "About Absendik",
  "settings.aboutSub": "Short app guide",
  "settings.switchSchoolProSub": "Switch school or add a new one",
  "settings.modulesSection": "Feature modules",
  "settings.gradePredikatSection": "Grades",
  "settings.gradePredikat": "Grade bands",
  "settings.gradePredikatSub": "Labels and score thresholds for grade recap",
  "settings.helpSection": "Help",
  "settings.moduleAttendance": "Attendance",
  "settings.moduleGrades": "Grades",
  "settings.modulesHint":
    "Per-school setting stored on this device only. At least one module must stay on.",
  "settings.modulesMinOne":
    "At least one module (Attendance or Grades) must stay enabled.",
  "settings.package": "Plan & subscription",
  "settings.packageIntro":
    "All plans keep daily data on your phone. Pro adds online backup and advanced features.",
  "settings.freePlanLead":
    "Free plan: 1 school, 5 classes, up to 120 active students, weekly & monthly reports, includes ads.",
  "settings.freePlanBadge": "Free",
  "settings.freeIncludesTitle": "Free plan includes:",
  "settings.proPlanLead":
    "Pro active — unlimited independent schools on your phone (excluding Absendik Sekolah), unlimited classes per school, unlimited students, semester reports, online backup, no ads.",
  "settings.proUnlockTitle": "Go Pro to unlock:",
  "settings.proIncludesTitle": "Pro includes:",
  "settings.proUpgradeHint":
    "Pay via Google Play. One Pro account per phone — transfer in Settings when you switch devices.",
  "settings.proDevUnlockHint": "Test mode: Pro is enabled for app development.",
  "settings.subscribeAlertTitle": "Go Pro",
  "settings.subscribeAlertBody":
    "Daily data stays on your phone. Pro adds:\n\n• Unlimited independent schools (excluding Absendik Sekolah)\n• Unlimited classes per school · unlimited subjects\n• Unlimited students\n• Semester reports\n• Online backup & automatic sync\n• Restore data when you change phones (transfer device in Settings)\n• No ads\n\nContinue to Google Play?",
  "settings.subscribeAlertBodyAndroid":
    "Daily data stays on your phone. Pro adds unlimited schools, unlimited classes per school, unlimited students, semester reports, online backup, and no ads.\n\n{price}\n\nContinue to Google Play?",
  "settings.restorePurchase": "Restore purchase",
  "settings.iapUnavailable":
    "Pro subscription is only available in the official app from Google Play.",
  "settings.iapIosSoon": "Pro subscription via the App Store is coming soon.",
  "settings.proPrice": "Price: {price}",
  "settings.signOut": "Sign out",
  "settings.signOutConfirm": "Sign out of your account?",
  "settings.freeDesc":
    "1 school · 5 classes · up to 120 students · weekly & monthly reports · download Excel · includes ads",
  "settings.proDesc":
    "Unlimited schools · unlimited classes per school · unlimited students · semester reports · online backup · no ads",
  "settings.upgradePro": "Go Pro",
  "settings.proActive": "Pro active",
  "settings.proDeviceConflict": "Pro registered on another device",
  "settings.proDeviceConflictBody":
    "Pro is active on {device}. Transfer to this phone if this is your account.",
  "settings.proDeviceUnknown": "another device",
  "settings.transferDevice": "Transfer to this phone",
  "settings.transferDeviceConfirm":
    "Pro will work on this phone and stop on the old device for online backup. Continue?",
  "settings.transferDeviceSuccess": "Pro transferred to this phone.",
  "settings.cloud": "Online backup",
  "settings.cloudIntro":
    "Pro only: copy data from your phone to online backup, then restore when you switch phones.",
  "settings.sync": "Back up now",
  "settings.syncDesc":
    "Upload schools, classes, students, attendance, and grades from this phone.",
  "settings.restore": "Restore backup",
  "settings.restoreDesc":
    "Replace this phone's data with the latest backup. Current data on this phone will be overwritten.",
  "settings.cloudHint": "Online backup is available on the Pro plan.",
  "settings.autoCloudSync": "Automatic backup",
  "settings.autoCloudSyncHint":
    "Data on your phone is backed up periodically (when the app is active and after changes). On by default for Pro.",
  "workspace.badgeSchool": "Absendik Sekolah",
  "workspace.badgeLocal": "On your phone",
  "workspace.badgeLocalArchive": "Archive before link",
  "workspace.localArchiveHint":
    "Older data with the same school name stays here — open it for reports and Excel downloads. New attendance goes through Absendik Sekolah.",
  "workspace.localArchiveBanner":
    "Archive from before you linked to your school. Reports and downloads still work; new attendance uses Absendik Sekolah.",
  "workspace.openLocalArchive": "Local archive on phone",
  "workspace.openLocalArchiveBody":
    "{count} school(s) · data from before Absendik Sekolah link",
  "workspace.localArchiveScreenTitle": "Local archive on phone",
  "workspace.localArchiveScreenHint":
    "Old on-device data from before your school was linked. Reports and downloads still work; new attendance uses Absendik Sekolah.",
  "workspace.localArchiveCount": "{count} archive(s) available",
  "workspace.localArchiveEmptyTitle": "No archives",
  "workspace.localArchiveEmptyBody":
    "An archive appears if you used the app locally first, then linked to Absendik Sekolah with the same school name.",
  "createWorkspace.linkedSchoolExists":
    "You are already linked to this school via Absendik Sekolah. Pick the Absendik Sekolah school instead of adding a duplicate on your phone.",
  "settings.danger": "Danger zone",
  "settings.wipe": "Delete data on this phone",
  "settings.wipeHint":
    "Removes classes, students, attendance, and grades on this phone. Your account is not deleted.",
  "settings.dataHint":
    "Attendance & grades are stored on this phone. Pro adds online backup.",
  "settings.adPrivacy": "Ad privacy",
  "settings.adPrivacySub": "Manage ad permissions and privacy preferences.",
  "pkg.free.school": "1 school",
  "pkg.free.students": "120 students",
  "pkg.free.classes": "5 classes · unlimited subjects",
  "pkg.free.recap": "Weekly & monthly reports",
  "pkg.free.excel": "Download Excel",
  "pkg.free.local": "Data on your phone",
  "pkg.free.ads": "Includes ads",
  "pkg.pro.school": "Unlimited independent schools",
  "pkg.pro.classes": "Unlimited classes per school · unlimited subjects",
  "pkg.pro.students": "Unlimited students",
  "pkg.pro.semester": "Semester reports",
  "pkg.pro.cloud": "Online backup",
  "pkg.pro.sync": "Transfer device in Settings",
  "pkg.pro.restore": "Restore when changing phone",
  "pkg.pro.noads": "No ads",
  "nav.tabHome": "Home",
  "nav.tabClasses": "Classes",
  "nav.tabRecap": "Reports",
  "nav.tabAccount": "Account",
  "nav.tabManage": "Manage",
  "nav.tabSettings": "Settings",
  "nav.tabManageClasses": "Classes",
  "nav.tabManageSubjects": "Subjects",
  "nav.tabManageStudents": "Students",
  "nav.greeting": "Hi, {name}. Ready to teach today?",
  "nav.quickActions": "Quick access",
  "nav.recentClasses": "Recent classes",
  "nav.statClasses": "Classes",
  "nav.statStudents": "Students",
  "nav.statSubjects": "Subjects",
  "nav.switchSchool": "Switch school",
  "nav.switchSchoolSub": "Choose another school where you teach",
  "nav.emptyHomeTitle": "No classes yet",
  "nav.emptyHomeBody": "Start by adding your first class.",
  "nav.classListTitle": "Class list",
  "nav.classListBodyClass": "Choose a class to take today's attendance.",
  "nav.classListBodySubject":
    "Choose a class, then choose a subject for attendance or grades.",
  "nav.openClass": "Open class",
  "nav.classActions": "Class tools",
  "nav.attendanceToday": "Today's attendance",
  "nav.attendance": "Attendance",
  "nav.students": "Student list",
  "nav.recap": "Attendance recap",
  "nav.grades": "Add grades",
  "nav.gradeRecap": "Grade recap",
  "nav.manageClass": "Manage class",
  "nav.manageSubject": "Manage subject",
  "nav.subjectsSection": "Subjects",
  "nav.addSubject": "Add subject",
  "nav.editSubject": "Edit subject",
  "nav.editStudent": "Edit student",
  "nav.modeClass": "Attendance by class",
  "nav.noChanges": "No changes.",
  "nav.subjectSaved": "Subject saved.",
  "nav.recapTitle": "Attendance reports",
  "nav.recapBody": "Pick a class for weekly, monthly, or semester reports.",
  "nav.viewRecap": "View report",
  "nav.accountSection": "Profile & app",
  "nav.schoolSection": "School",
  "nav.sessionSection": "Session",
  "nav.guide": "User guide",
  "nav.guideSub": "Replay the app guide",
  "nav.allClasses": "All classes",
  "classPicker.subjects": "Choose a class to manage its subjects.",
  "classPicker.students": "Choose a class to manage its student list.",
  "classPicker.tapToOpen": "Open class",
  "manage.hubHint":
    "Manage classes, subjects, and students here. Attendance and grades are on the Home tab.",
  "manage.hubClasses": "Classes",
  "manage.hubClassesSub": "Add, edit, or delete classes",
  "manage.hubSubjects": "Subjects",
  "manage.hubSubjectsSub": "Manage subjects per class",
  "manage.hubStudents": "Students",
  "manage.hubStudentsSub": "Manage student lists per class",
  "home.hubHint": "Choose a module to get started.",
  "home.hubAttendanceSub": "Take daily attendance by class or subject",
  "home.hubGradesSub": "Enter task grades and view grade reports",
  "home.noModulesHint":
    "No modules are active. Enable Attendance or Grades in Settings.",
  "home.tapClassForAttendance": "Take attendance for this class",
  "home.tapClassForGrades": "Enter grades for this class",
  "home.tapClassPickModule": "Attendance & grades",
  "home.openManageSub": "Classes, subjects, and students",
  "home.classModuleHint": "Choose a module for this class.",
  "home.classesHint": "Tap a class for attendance or grades.",
  "home.classesSubjectHint":
    "Tap a class, pick a subject, then take attendance or enter grades.",
  "home.classesAttendanceHint": "Tap a class to take attendance.",
  "home.classesSubjectAttendanceHint":
    "Tap a class, pick a subject, then take attendance.",
  "home.classesGradesHint": "Tap a class to enter grades.",
  "home.classesSubjectGradesHint":
    "Tap a class, pick a subject, then enter grades.",
  "home.moduleClassesAttendanceHint":
    "Choose a class to take today's attendance.",
  "home.moduleClassesGradesHint": "Choose a class to enter grades.",
  "home.moduleClassesSubjectAttendanceHint":
    "Choose a class, then a subject for attendance.",
  "home.moduleClassesSubjectGradesHint":
    "Choose a class, then a subject for grades.",
  "home.moduleSubjectAttendanceHint": "Tap a subject to take attendance.",
  "home.moduleSubjectGradesHint": "Tap a subject to enter grades.",
  "home.tapSubjectForAttendance": "Take attendance for this subject",
  "home.tapSubjectForGrades": "Enter grades for this subject",
  "modules.attendance": "Attendance",
  "modules.grades": "Grades",
  "common.optional": "Optional",
  "common.loginFailed": "Sign-in failed.",
  "common.menu": "Menu",
  "workspace.pickSchool": "Choose school",
  "workspace.addSchool": "Add school",
  "workspace.emptyTitle": "No schools yet",
  "workspace.emptyBody": "Add your first school to start teaching.",
  "workspace.notLinkedSchoolHint":
    "This account is not linked to Absendik Sekolah. Sign out, then sign in with the email and password your school admin created — not a separate Google login.",
  "workspace.manualPickHint":
    "Your account is linked to the Absendik Sekolah entry below. For an independent school on this phone, tap Add school. Older local archives appear at the bottom if you used them before.",
  "workspace.freeLimitTitle": "School quota full",
  "workspace.freeLimitBody":
    "The free plan includes 1 local school on your device (in addition to Absendik Sekolah). Your quota is full. Upgrade to Pro for unlimited local schools?",
  "bootstrap.retry": "Try again",
  "bootstrap.signOut": "Sign out",
  "bootstrap.profileLoadFailed": "Could not load profile.",
  "bootstrap.networkHint": " Check your internet connection and try again.",
  "bootstrap.sessionLoadFailed":
    "Could not load session. Try reopening the app.",
  "onboarding.welcomeNav": "Welcome",
  "onboarding.skip": "Skip",
  "onboarding.next": "Continue",
  "onboarding.start": "Get started",
  "onboarding.stepA11y": "Step {step}",
  "onboarding.welcome.title": "Welcome to Absendik Guru",
  "onboarding.welcome.body":
    "Record attendance, task grades, and reports — per homeroom or subject, right from your phone.",
  "onboarding.storage.title": "Data stays on your phone",
  "onboarding.storage.body":
    "Classes, students, attendance, and grades are stored on your phone. Daily work works offline. Pro adds online backup.",
  "onboarding.storage.bullet1":
    "Free: 1 school, 5 classes, 120 students, weekly & monthly reports, download Excel, includes ads",
  "onboarding.storage.bullet2":
    "Pro: unlimited independent schools, unlimited classes per school, unlimited students, semester reports, online backup, no ads",
  "onboarding.school.title": "Your own school on the phone",
  "onboarding.school.body":
    "Create a workspace if you are not linked to Absendik Sekolah yet. Free: 1 school; Pro: unlimited independent schools (excluding Absendik Sekolah).",
  "onboarding.school.bullet1":
    "Set how attendance works: by class or by subject",
  "onboarding.school.bullet2":
    "Free: 5 classes per school · Pro: unlimited classes per school · unlimited subjects",
  "onboarding.schoolLink.title": "Link Absendik Sekolah",
  "onboarding.schoolLink.body":
    "When your school uses Absendik Sekolah, admins prepare classes and students — no duplicate entry.",
  "onboarding.schoolLink.bullet1":
    "Join via invitation link from Absendik Sekolah",
  "onboarding.schoolLink.bullet2":
    "Pick the Absendik Sekolah workspace for daily attendance & grades",
  "onboarding.schoolLink.bullet3":
    "Adding classes or students stays with the school admin, not in the teacher app",
  "onboarding.class.title": "Classes & students",
  "onboarding.class.body":
    "Manage classes & students on the Manage tab; daily attendance and grades on Home.",
  "onboarding.class.bullet1":
    "Manage tab → classes, subjects, and student lists",
  "onboarding.class.bullet2":
    "Home tab → pick a class → Attendance or Grades module",
  "onboarding.class.bullet3":
    "Set class-wide or subject-based attendance when creating a school",
  "onboarding.attendance.title": "Daily attendance",
  "onboarding.attendance.body": "The step you do most often every day.",
  "onboarding.attendance.bullet1":
    "Home → Attendance → pick a class (and subject if subject mode)",
  "onboarding.attendance.bullet2":
    "Status starts empty; pick Present/Sick/Excused/Absent or tap Mark all present",
  "onboarding.attendance.bullet3":
    "Header ⋮ menu: attendance report, student list, manage class",
  "onboarding.grades.title": "Task grades",
  "onboarding.grades.body":
    "Record quiz, homework, or other task scores by class or subject.",
  "onboarding.grades.bullet1":
    "Home → Grades → pick a class (and subject if subject mode)",
  "onboarding.grades.bullet2":
    "Add a task, fill each student's score in the right column, then Save",
  "onboarding.grades.bullet3":
    "Header ⋮ → Grade report; independent schools can set bands in Settings",
  "onboarding.more.title": "Reports & backup",
  "onboarding.more.body":
    "After data is filled in, open reports for admin needs. Pro can back up to the cloud.",
  "onboarding.more.bullet1":
    "Attendance & grade reports: weekly/monthly (Free & Pro), filters & search",
  "onboarding.more.bullet2": "Semester reports (Pro)",
  "onboarding.more.bullet3": "Download Excel from the report screen",
  "onboarding.more.bullet4":
    "Settings: feature modules, grade bands, Pro, online backup, schedule reminders",
  "onboarding.startStep.title": "Ready to start",
  "onboarding.startStep.body":
    "Start by adding your own school or joining Absendik Sekolah.",
  "onboarding.startStep.bullet1":
    "Daily data stays on your phone; cloud backup only if you enable it (Pro)",
  "createWorkspace.nameRequired": "School name is required.",
  "createWorkspace.levelRequired": "School level is required.",
  "createWorkspace.cityRequired": "City is required.",
  "createWorkspace.hint":
    "Free plan: 1 independent school, 5 classes. Pro: unlimited independent schools (excluding Absendik Sekolah), unlimited classes per school.",
  "createWorkspace.nameLabel": "School name *",
  "createWorkspace.namePlaceholder": "Example: Lincoln Middle School",
  "createWorkspace.levelLabel": "Level *",
  "createWorkspace.cityLabel": "City *",
  "createWorkspace.cityPlaceholder": "Bandung",
  "createWorkspace.showExtra": "Add school details (optional)",
  "createWorkspace.hideExtra": "Hide school details",
  "createWorkspace.npsn": "School ID (NPSN)",
  "createWorkspace.province": "Province / state",
  "createWorkspace.address": "Address",
  "createWorkspace.pic": "Contact person",
  "createWorkspace.phone": "Phone / WhatsApp",
  "createWorkspace.email": "Email",
  "createWorkspace.attendanceSection": "Attendance",
  "createWorkspace.modeSubject": "By subject",
  "quota.unlimitedSchools": "Unlimited schools",
  "quota.schoolCount": "{count} schools",
  "quota.unlimitedStudents": "unlimited students",
  "quota.studentLimit": "up to {count} students",
  "quota.unlimitedClassesPerSchool": "unlimited classes",
  "quota.classLimitPerSchool": "up to {count} classes",
  "quota.unlimitedSubjects": "unlimited subjects",
  "quota.classesSubjects": "unlimited classes & subjects",
  "settings.proActivateFailed": "Could not activate Pro.",
  "menu.settings": "Settings",
  "menu.switchSchool": "Switch school",
  "menu.signOut": "Sign out",
  "classMenu.weeklyRecap": "Weekly report",
  "classMenu.editOrDelete": "Edit or delete class",
  "ads.sponsorTitle": "Sponsored message",
  "ads.placement.attendanceSaved":
    "Attendance saved. Thanks for using Absendik Free.",
  "ads.placement.gradeSaved": "Grades saved. Thanks for using Absendik Free.",
  "ads.placement.recapExport":
    "Report downloaded. Thanks for using Absendik Free.",
  "ads.placement.syncComplete":
    "Backup complete. Thanks for using Absendik Free.",
  "ads.placement.default": "Thanks for using Absendik Free.",
  "ads.mockLabel": "Ad space",
  "ads.mockSub":
    "Ads appear rarely and never while you are taking attendance or entering grades.",
  "ads.continue": "Continue",
  "ads.upgradeProNoAds": "Pro · no ads",
  "ads.bannerHint": "Ad support helps keep Absendik free on your phone.",
  "ads.upgradeShort": "Pro · no ads",
  "export.shareRecap": "Download attendance report",
  "export.shareGradeRecap": "Download grade report",
  "export.shareGradeHistory": "Download grade history",
  "export.noData": "Nothing to download yet.",
  "export.semesterRecapPro":
    "Semester attendance reports are available on Pro.",
  "export.semesterGradePro": "Semester grade reports are available on Pro.",
  "export.loadRecapFirst":
    "Load the report first, then download from the report screen.",
  "export.createFileFailed": "Could not create the Excel file.",
  "export.shareUnsupported": "Sharing files is not supported on this phone.",
  "export.confirmTitle": "Download Excel",
  "export.confirmMessage":
    "An Excel file will be created. You can share or save it using the system menu.",
  "export.confirmMessageAndroid":
    "An Excel file will be created. Save it to Storage, Drive, or another app via the share menu. Storage permission is requested when needed.",
  "export.confirmContinue": "Continue",
  "export.exportCancelled": "Download cancelled.",
  "export.storagePermissionTitle": "Storage access",
  "export.storagePermissionMessage":
    "Absendik Guru needs permission to save Excel files to your device storage.",
  "export.storagePermissionDenied":
    "Storage permission denied. You can still try saving via the share menu after the file is created.",
  "student.quotaAtMax": "Maximum {max} students. Go Pro to add more.",
  "error.notSignedIn": "Not signed in.",
  "error.noServerResponse":
    "The server did not respond. Check your internet connection and try again.",
  "error.serverInvalidResponse":
    "The server returned an invalid response. Try again or update the app.",
  "error.connectionFailed":
    "Could not reach the server. Check your internet connection and try again.",
  "error.requestFailed": "Request failed.",
  "error.schoolClassesLoadFailed":
    "Could not load classes from Absendik Sekolah. Pull down to refresh.",
  "error.schoolGradesLoadFailed":
    "Could not load grades from Absendik Sekolah. Pull down to refresh.",
  "error.schoolGradesSaveFailed":
    "Could not save grades. Check your connection and try again.",
  "error.schoolGradeRecapLoadFailed":
    "Could not load grade report. Pull down to refresh.",
  "error.generic": "Something went wrong. Please try again.",
  "cloud.needPro": "Activate Pro first to back up data online.",
  "cloud.nothingToBackup": "Nothing on this phone to back up yet.",
  "cloud.needProRestore": "Activate Pro first to restore a backup.",
  "cloud.noBackupYet":
    "No online backup yet. Back up from your old phone first.",
  "local.dbOpenFailed":
    "Could not open data on this phone. Try reopening the app.",
  "local.freeSchoolLimit":
    "The free plan supports one independent school on your phone. Go Pro for unlimited independent schools (excluding Absendik Sekolah).",
  "local.classLimitBody":
    "Class limit reached for this school (max {max} classes). Go Pro for a higher limit.",
  "cloud.restoreFailed": "Could not restore backup.",
  "iap.purchaseInProgress": "Purchase still processing.",
  "workspace.schoolQuotaFull":
    "Independent school limit reached (max {max} schools, excluding Absendik Sekolah).",
  "iap.cancelled": "Purchase cancelled.",
  "iap.purchaseFailed": "Purchase failed.",
  "iap.tokenMissing": "Purchase token not found.",
  "iap.noActiveSubscription":
    "No active Pro subscription on this Google Play account.",
  "iap.openPlayFailed": "Could not open Google Play.",
  "iap.restoreFailed": "Could not restore purchase.",
};

export const translations = { id, en } as const;

export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  let text = translations[locale][key] ?? translations.id[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
