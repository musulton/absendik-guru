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
  | "login.featureJournal"
  | "login.featureNotes"
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
  | "subjects.addStudentPrompt"
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
  | "grades.scoreRequired"
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
  | "studentNotesDetail.title"
  | "studentNotesDetail.history"
  | "studentNotesDetail.empty"
  | "studentNotesDetail.records"
  | "journalRecap.empty"
  | "journalRecap.sessionsRecorded"
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
  | "recap.chartAttendance"
  | "recap.chartGrades"
  | "recap.chartAttendanceTrend"
  | "recap.chartGradesTrend"
  | "recap.chartAttendanceSemesterTrend"
  | "recap.chartGradesSemesterTrend"
  | "recap.chartEmpty"
  | "recap.periodWeekly"
  | "recap.periodMonthly"
  | "recap.periodSemester"
  | "recap.periodLabel"
  | "recap.choosePeriod"
  | "recap.segmentWeekly"
  | "recap.segmentMonthly"
  | "recap.segmentSemester"
  | "recap.tabChart"
  | "recap.tabTable"
  | "recap.chartHeroAttendance"
  | "recap.chartHeroAttendanceHint"
  | "recap.chartHeroGrade"
  | "recap.chartHeroGradeHint"
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
  | "settings.moduleTeachingJournal"
  | "settings.moduleStudentNotes"
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
  | "settings.restoreNotFound"
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
  | "nav.journalRecap"
  | "nav.teachingJournal"
  | "nav.studentNotes"
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
  | "manage.hubGradePredikat"
  | "manage.hubGradePredikatSub"
  | "manage.hubStudentSort"
  | "manage.hubStudentSortSub"
  | "studentSort.title"
  | "studentSort.desc"
  | "studentSort.section"
  | "studentSort.byName"
  | "studentSort.byNis"
  | "studentSort.hint"
  | "studentSort.saved"
  | "students.tapToEdit"
  | "settings.restorePurchaseHint"
  | "home.hubHint"
  | "home.hubAttendanceSub"
  | "home.hubGradesSub"
  | "home.hubTeachingJournalSub"
  | "home.hubStudentNotesSub"
  | "home.noModulesHint"
  | "home.tapClassForAttendance"
  | "home.tapClassForGrades"
  | "home.tapClassPickModule"
  | "home.openManageSub"
  | "home.classModuleHint"
  | "home.startSessionTitle"
  | "home.startSessionSub"
  | "home.directModuleSection"
  | "home.recapTitle"
  | "home.recapSub"
  | "home.recapPickerTitle"
  | "home.recapPickerSub"
  | "home.sessionFlowHint"
  | "home.classesSessionHint"
  | "home.classesSessionSubjectHint"
  | "home.tapClassStartSession"
  | "sessionFlow.progressTitle"
  | "sessionFlow.stepShortAttendance"
  | "sessionFlow.stepShortJournal"
  | "sessionFlow.stepShortGrades"
  | "sessionFlow.stepShortNotes"
  | "sessionFlow.optional"
  | "sessionFlow.afterAttendanceTitle"
  | "sessionFlow.afterAttendanceBody"
  | "sessionFlow.continueJournal"
  | "sessionFlow.skipJournal"
  | "sessionFlow.afterJournalTitle"
  | "sessionFlow.afterJournalBody"
  | "sessionFlow.continueGrades"
  | "sessionFlow.skip"
  | "sessionFlow.afterGradesTitle"
  | "sessionFlow.afterGradesBody"
  | "sessionFlow.continueStudentNotes"
  | "sessionFlow.done"
  | "sessionFlow.afterNoteTitle"
  | "sessionFlow.afterNoteBody"
  | "sessionFlow.pickAnotherStudent"
  | "sessionFlow.finishSession"
  | "sessionFlow.nextStep"
  | "home.classesHint"
  | "home.classesSubjectHint"
  | "home.classesAttendanceHint"
  | "home.classesSubjectAttendanceHint"
  | "home.classesGradesHint"
  | "home.classesSubjectGradesHint"
  | "home.classesJournalHint"
  | "home.classesSubjectJournalHint"
  | "home.classesStudentNotesHint"
  | "home.moduleClassesAttendanceHint"
  | "home.moduleClassesGradesHint"
  | "home.moduleClassesSubjectAttendanceHint"
  | "home.moduleClassesSubjectGradesHint"
  | "home.moduleSubjectAttendanceHint"
  | "home.moduleSubjectGradesHint"
  | "home.moduleSubjectJournalHint"
  | "home.tapSubjectForAttendance"
  | "home.tapSubjectForGrades"
  | "home.tapSubjectForJournal"
  | "modules.attendance"
  | "modules.grades"
  | "modules.teachingJournal"
  | "modules.studentNotes"
  | "teachingJournal.saved"
  | "teachingJournal.hint"
  | "teachingJournal.fillRequired"
  | "teachingJournal.material"
  | "teachingJournal.method"
  | "teachingJournal.notes"
  | "teachingJournal.materialPlaceholder"
  | "teachingJournal.methodPlaceholder"
  | "teachingJournal.notesPlaceholder"
  | "studentNotes.group.positive"
  | "studentNotes.group.academic"
  | "studentNotes.group.attendance"
  | "studentNotes.group.attitude"
  | "studentNotes.group.other"
  | "studentNotes.preset.active_questions"
  | "studentNotes.preset.helps_friends"
  | "studentNotes.preset.discipline"
  | "studentNotes.preset.needs_remedial"
  | "studentNotes.preset.needs_support"
  | "studentNotes.preset.understands_well"
  | "studentNotes.preset.often_late"
  | "studentNotes.preset.absent_unexcused"
  | "studentNotes.preset.lacks_focus"
  | "studentNotes.preset.disrupts_peers"
  | "studentNotes.preset.good_attitude"
  | "studentNotes.otherOption"
  | "studentNotes.otherLabel"
  | "studentNotes.otherPlaceholder"
  | "studentNotes.optionLabel"
  | "studentNotes.selectRequired"
  | "studentNotes.otherRequired"
  | "studentNotes.saved"
  | "studentNotes.deleteTitle"
  | "studentNotes.deleteBody"
  | "studentNotes.deleteAction"
  | "studentNotes.save"
  | "studentNotes.hint"
  | "studentNotes.addSection"
  | "studentNotes.historySection"
  | "studentNotes.empty"
  | "studentNotes.tapToOpen"
  | "studentNotes.tapToAdd"
  | "studentNotes.classHint"
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
  | "onboarding.modules.title"
  | "onboarding.modules.body"
  | "onboarding.modules.settingsHint"
  | "onboarding.session.title"
  | "onboarding.session.body"
  | "onboarding.session.bullet1"
  | "onboarding.session.bullet2"
  | "onboarding.session.bullet3"
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
  | "export.shareJournalRecap"
  | "export.shareGradeHistory"
  | "export.noData"
  | "export.semesterRecapPro"
  | "export.semesterGradePro"
  | "export.semesterJournalPro"
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
  "app.name": "Catatan Guru",
  "app.tagline":
    "Absensi & nilai per kelas atau mata pelajaran — dari genggaman guru",
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
    "Kelola absensi, nilai, jurnal, dan catatan siswa lebih cepat — cukup dari HP Anda.",
  "login.welcomeTitle": "Halo, Guru!",
  "login.welcomeSub": "Masuk sekali, langsung kelola kelas di genggaman.",
  "login.featureAttendance": "Absensi",
  "login.featureGrades": "Nilai",
  "login.featureRecap": "Rekap Laporan",
  "login.featureJournal": "Jurnal Mengajar",
  "login.featureNotes": "Catatan Siswa",
  "login.google": "Masuk dengan Google",
  "login.googleHint": "Paling cepat — pakai akun Google yang sudah ada",
  "login.googleProviderDisabled":
    "Login Google belum tersedia. Gunakan email dan kata sandi, atau hubungi admin sekolah.",
  "login.googleCallbackFailed":
    "Login Google tidak selesai. Coba lagi atau gunakan email dan kata sandi.",
  "login.googleLocalhostRedirect":
    "Login Google tidak dapat kembali ke aplikasi. Coba lagi dengan koneksi internet stabil.",
  "login.googleOAuthWebOrigin":
    "Login Google gagal. Periksa koneksi internet lalu coba lagi, atau gunakan email dan kata sandi.",
  "login.googleOAuthTimeout":
    "Login Google terlalu lama. Coba lagi atau gunakan email dan kata sandi.",
  "login.googleOAuthCancelled": "Login Google dibatalkan.",
  "login.googleSignInFailed":
    "Login Google gagal. Coba lagi atau gunakan email dan kata sandi.",
  "login.googleRedirectUriMismatch":
    "Login Google belum bisa dipakai saat ini. Coba lagi nanti atau gunakan email dan kata sandi.",
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
  "login.emailHint": "Gunakan email akun yang sudah terdaftar.",
  "login.schoolLinkHint":
    "Catatan Guru hadir untuk membantu absensi dan nilai — per rombel atau per mata pelajaran. Waktu Anda lebih berharga untuk mendidik daripada administrasi.",
  "classes.hintTitle": "Mulai dari kelas",
  "classes.hintBodyClass":
    "Gunakan tombol absensi atau nilai di setiap kelas. Tombol menu lainnya untuk siswa, rekap, dan kelola kelas.",
  "classes.hintBodySubject":
    "Pilih kelas terlebih dahulu, lalu pilih mata pelajaran untuk absensi atau nilai.",
  "classes.tapToAttendance": "Isi absensi",
  "classes.tapToSubjects": "Pilih mata pelajaran",
  "classes.tapToSubjectsGrades": "Kelola mata pelajaran & nilai",
  "classes.empty": "Belum ada kelas. Ketuk + untuk menambahkan kelas pertama.",
  "classes.emptySchool":
    "Belum ada kelas. Ketuk + untuk menambahkan kelas pertama.",
  "classes.hintBodySchool":
    "Kelola kelas dan siswa di tab Pengelolaan, lalu absensi dan nilai di tab Beranda.",
  "classes.addClass": "Tambah kelas",
  "classes.addClassHint": "Contoh: VII-A, VIII-B, atau Kelompok Tahfidz.",
  "classes.manageHint":
    "Kelola daftar kelas. Ketuk kelas untuk mengubah atau menghapus.",
  "classes.tapToManage": "Kelola kelas",
  "classes.emptyHome":
    "Belum ada kelas. Ketuk Pengelolaan di atas untuk menambahkan kelas pertama.",
  "subjects.tapToManage": "Kelola mata pelajaran",
  "subjects.hintTitle": "Pilih mata pelajaran",
  "subjects.hintBody":
    "Ikon siswa (kanan atas) untuk kelola siswa, ikon buku untuk tambah mata pelajaran. Ketuk jumlah siswa di atas juga bisa.",
  "subjects.hintBodyGrades":
    "Ikon siswa untuk kelola siswa, ikon buku untuk tambah mata pelajaran. Ketuk mata pelajaran untuk input nilai.",
  "subjects.hintBodyBoth":
    "Ikon siswa untuk kelola siswa, ikon buku untuk tambah mata pelajaran. Ketuk ikon absensi atau nilai di setiap mata pelajaran.",
  "subjects.tapToAttendance": "Isi absensi",
  "subjects.empty":
    "Belum ada mata pelajaran. Ketuk + di kanan atas untuk menambahkan.",
  "subjects.noStudents": "Belum ada siswa di kelas ini.",
  "subjects.addStudent": "Tambah siswa",
  "subjects.addStudentPrompt":
    "Tambahkan siswa terlebih dahulu untuk mulai pertemuan atau membuka modul ini.",
  "subjects.manageHint":
    "Kelola mata pelajaran kelas ini. Ketuk mata pelajaran untuk mengubah atau menghapus.",
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
  "attendance.setAllPresent": "Tandai semua hadir",
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
  "grades.scoreRequired": "Isi minimal satu nilai siswa sebelum menyimpan.",
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
  "gradePredikat.minField": "Nilai minimum",
  "gradePredikat.minAuto": "Otomatis < Cukup",
  "gradePredikat.hint":
    "Ambang harus turun: Sangat baik > Baik > Cukup (1–100). Nilai di bawah Cukup masuk predikat terendah.",
  "gradePredikat.save": "Simpan pengaturan",
  "gradePredikat.reset": "Kembalikan default",
  "gradePredikat.resetConfirm":
    "Kembalikan predikat ke default (≥90 / ≥80 / ≥70)?",
  "gradePredikat.saved": "Pengaturan predikat tersimpan.",
  "gradePredikat.schoolReadOnly":
    "Predikat dikunci untuk sekolah terhubung — atur lewat admin.",
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
  "studentNotesDetail.title": "Riwayat catatan",
  "studentNotesDetail.history": "Riwayat catatan",
  "studentNotesDetail.empty": "Belum ada catatan untuk siswa ini.",
  "studentNotesDetail.records": "{count} catatan tercatat",
  "journalRecap.empty": "Belum ada jurnal mengajar pada periode ini.",
  "journalRecap.sessionsRecorded": "{count} pertemuan tercatat",
  "students.hint":
    "Ketuk ikon absensi atau nilai untuk melihat riwayat siswa. Ikon ⋯ untuk mengubah data.",
  "students.hintSchool":
    "Kelola daftar siswa di tab Pengelolaan. Ketuk ikon absensi atau nilai untuk riwayat.",
  "students.manageHint":
    "Kelola daftar siswa kelas ini. Ketuk siswa untuk mengubah atau menghapus.",
  "school.readonlyTitle": "Dikelola admin sekolah",
  "school.noStudentsHint":
    "Belum ada siswa di kelas ini. Ketuk + untuk menambahkan siswa.",
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
  "recap.chartAttendance": "Grafik kehadiran",
  "recap.chartGrades": "Grafik predikat nilai",
  "recap.chartAttendanceTrend": "Tren kehadiran mingguan",
  "recap.chartGradesTrend": "Tren rata-rata nilai mingguan",
  "recap.chartAttendanceSemesterTrend": "Tren kehadiran bulanan (semester)",
  "recap.chartGradesSemesterTrend": "Tren rata-rata nilai bulanan (semester)",
  "recap.chartEmpty": "Belum ada data untuk grafik",
  "recap.periodWeekly": "Mingguan",
  "recap.periodMonthly": "Bulanan",
  "recap.periodSemester": "Semester",
  "recap.periodLabel": "Periode",
  "recap.choosePeriod": "Pilih periode",
  "recap.segmentWeekly": "Minggu",
  "recap.segmentMonthly": "Bulan",
  "recap.segmentSemester": "Semester",
  "recap.tabChart": "Grafik",
  "recap.tabTable": "Tabel",
  "recap.chartHeroAttendance": "Tingkat kehadiran",
  "recap.chartHeroAttendanceHint": "Dari {count} catatan kehadiran",
  "recap.chartHeroGrade": "Rata-rata kelas",
  "recap.chartHeroGradeHint": "Berdasarkan {count} siswa yang sudah dinilai",
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
  "student.quotaTitle": "Batas siswa",
  "student.quotaUsage": "{used} dari {max} siswa aktif",
  "student.quotaLimit":
    "Batas siswa paket gratis sudah tercapai. Paket Pro membuka siswa tanpa batas.",
  "student.quotaPro": "{count} siswa aktif · tanpa batas",
  "student.fullName": "Nama lengkap",
  "student.number": "Nomor Induk Siswa atau nomor siswa (opsional)",
  "student.nameRequired": "Nama siswa wajib diisi.",
  "student.classLabel": "Kelas {name}",
  "student.deleteTitle": "Hapus siswa?",
  "student.deleteBody":
    "Siswa akan dinonaktifkan dan tidak dihitung dalam batas siswa aktif.",
  "student.deleteAction": "Hapus siswa",
  "about.title": "Tentang Catatan Guru",
  "about.subtitle":
    "Absensi & nilai per kelas atau mata pelajaran — dari HP guru.",
  "about.whatIs": "Apa ini?",
  "about.whatIsBody":
    "Catat kehadiran, nilai, jurnal, catatan siswa, dan rekap per kelas atau mata pelajaran — langsung dari HP Anda.",
  "about.howToUse": "Langkah awal",
  "about.step1": "Pilih atau buat sekolah di awal",
  "about.step2": "Tab Pengelolaan: kelas, mata pelajaran, dan siswa",
  "about.step3": "Tab Beranda: absensi & nilai harian per kelas",
  "about.step4": "Rekap mingguan/bulanan dan unduh Excel",
  "about.featuresTitle": "Fitur lain",
  "about.featureGrades":
    "Input nilai per tugas, rekap nilai, filter predikat, unduh Excel.",
  "about.featurePredikat":
    "Atur label dan ambang predikat di Pengaturan → Predikat nilai.",
  "about.featureSchoolLink":
    "Jurnal mengajar per pertemuan dan catatan siswa — aktifkan fitur di Pengaturan.",
  "about.featureCloud":
    "Paket Pro: cadangkan data secara online dan pulihkan saat ganti HP lewat Pengaturan → Cadangan online.",
  "about.plansHint":
    "Detail paket gratis dan Paket Pro ada di Pengaturan → Paket dan langganan.",
  "about.schoolHint":
    "Mengajar di beberapa sekolah? Tambahkan sekolah terpisah untuk setiap lembaga.",
  "about.footer": "Catatan Guru",
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
  "settings.about": "Tentang Catatan Guru",
  "settings.aboutSub": "Panduan aplikasi",
  "settings.switchSchoolProSub": "Ganti sekolah atau tambah sekolah baru",
  "settings.modulesSection": "Fitur",
  "settings.gradePredikatSection": "Nilai",
  "settings.gradePredikat": "Predikat nilai",
  "settings.gradePredikatSub": "Label dan ambang batas predikat rekap",
  "settings.helpSection": "Bantuan",
  "settings.moduleAttendance": "Absensi",
  "settings.moduleGrades": "Penilaian",
  "settings.moduleTeachingJournal": "Jurnal mengajar",
  "settings.moduleStudentNotes": "Catatan siswa",
  "settings.modulesHint":
    "Aktifkan fitur yang Anda pakai. Minimal satu fitur harus tetap aktif.",
  "settings.modulesMinOne": "Minimal satu fitur harus tetap aktif.",
  "settings.package": "Paket dan langganan",
  "settings.packageIntro":
    "Data harian tetap tersimpan di HP Anda. Paket Pro menambah cadangan online dan fitur lanjutan.",
  "settings.freePlanLead":
    "Paket gratis mencakup 1 sekolah, 5 kelas, hingga 120 siswa, rekap mingguan/bulanan, dan iklan ringan.",
  "settings.freePlanBadge": "Gratis",
  "settings.freeIncludesTitle": "Paket gratis termasuk:",
  "settings.proPlanLead":
    "Paket Pro aktif — sekolah, kelas, dan siswa tanpa batas; rekap semester; cadangan online; tanpa iklan.",
  "settings.proUnlockTitle": "Paket Pro membuka:",
  "settings.proIncludesTitle": "Paket Pro termasuk:",
  "settings.proUpgradeHint":
    "Berlangganan lewat Google Play. Saat ganti HP, Paket Pro bisa dipindahkan dari Pengaturan.",
  "settings.proDevUnlockHint":
    "Mode uji: Pro aktif untuk pengembangan aplikasi.",
  "settings.subscribeAlertTitle": "Aktifkan Paket Pro",
  "settings.subscribeAlertBody":
    "Data harian tetap di HP Anda. Paket Pro menambah:\n\n• Sekolah, kelas, dan siswa tanpa batas\n• Rekap semester\n• Cadangan online otomatis\n• Pulihkan data saat ganti HP\n• Tanpa iklan\n\nLanjut ke Google Play?",
  "settings.subscribeAlertBodyAndroid":
    "Data harian tetap di HP Anda. Paket Pro menambah sekolah, kelas, dan siswa tanpa batas; rekap semester; cadangan online; dan tanpa iklan.\n\n{price}\n\nLanjut ke Google Play?",
  "settings.restorePurchase": "Pulihkan langganan",
  "settings.restoreNotFound":
    "Langganan tidak ditemukan untuk akun ini. Pastikan Anda login dengan akun yang sama saat berlangganan.",
  "settings.iapUnavailable":
    "Langganan Pro hanya tersedia di aplikasi resmi dari Google Play.",
  "settings.iapIosSoon": "Langganan Pro via App Store menyusul.",
  "settings.proPrice": "Harga: {price}",
  "settings.signOut": "Keluar",
  "settings.signOutConfirm": "Keluar dari akun?",
  "settings.freeDesc":
    "1 sekolah · 5 kelas · hingga 120 siswa · rekap mingguan dan bulanan · unduh Excel · ada iklan",
  "settings.proDesc":
    "Sekolah tanpa batas · kelas tanpa batas per sekolah · siswa tanpa batas · rekap semester · cadangan online · tanpa iklan",
  "settings.upgradePro": "Aktifkan Paket Pro",
  "settings.proActive": "Paket Pro aktif",
  "settings.proDeviceConflict": "Paket Pro aktif di perangkat lain",
  "settings.proDeviceConflictBody":
    "Paket Pro aktif di {device}. Pindahkan ke HP ini jika Anda yang memakai akun ini.",
  "settings.proDeviceUnknown": "perangkat lain",
  "settings.transferDevice": "Pindahkan ke HP ini",
  "settings.transferDeviceConfirm":
    "Paket Pro akan aktif di HP ini dan nonaktif di perangkat lama untuk cadangan online. Lanjut?",
  "settings.transferDeviceSuccess": "Paket Pro dipindahkan ke HP ini.",
  "settings.cloud": "Cadangan online",
  "settings.cloudIntro":
    "Paket Pro: salin data ke cadangan online yang aman, lalu pulihkan saat ganti HP.",
  "settings.sync": "Cadangkan sekarang",
  "settings.syncDesc":
    "Unggah sekolah, kelas, siswa, absensi, nilai, jurnal, dan catatan siswa ke cadangan online.",
  "settings.restore": "Pulihkan cadangan",
  "settings.restoreDesc":
    "Ganti data di HP ini dengan cadangan online terakhir. Data saat ini akan diganti.",
  "settings.cloudHint": "Cadangan online tersedia di Paket Pro.",
  "settings.autoCloudSync": "Cadangkan otomatis",
  "settings.autoCloudSyncHint":
    "Data dicadangkan secara berkala saat aplikasi aktif dan setelah ada perubahan. Aktif otomatis untuk Paket Pro.",
  "workspace.badgeSchool": "Terhubung",
  "workspace.badgeLocal": "Di HP",
  "workspace.badgeLocalArchive": "Data lama",
  "workspace.localArchiveHint":
    "Salinan data lama dengan nama sekolah yang sama — buka untuk rekap dan unduh Excel.",
  "workspace.localArchiveBanner":
    "Arsip data lama di HP. Rekap dan unduh Excel masih bisa dipakai.",
  "workspace.openLocalArchive": "Data lama",
  "workspace.openLocalArchiveBody": "{count} sekolah · salinan data lama",
  "workspace.localArchiveScreenTitle": "Data lama",
  "workspace.localArchiveScreenHint":
    "Data lama yang tersimpan di HP. Rekap dan unduh Excel masih bisa dipakai.",
  "workspace.localArchiveCount": "{count} arsip tersedia",
  "workspace.localArchiveEmptyTitle": "Tidak ada arsip",
  "workspace.localArchiveEmptyBody":
    "Arsip muncul jika Anda pernah menyimpan data lokal dengan nama sekolah yang sama.",
  "createWorkspace.linkedSchoolExists":
    "Sekolah ini sudah ada di daftar. Pilih dari daftar sekolah, bukan menambah duplikat.",
  "settings.danger": "Hapus data",
  "settings.wipe": "Hapus data di HP",
  "settings.wipeHint":
    "Menghapus kelas, siswa, absensi, nilai, jurnal, dan catatan di HP ini. Akun Anda tidak ikut terhapus.",
  "settings.dataHint":
    "Data harian disimpan di HP. Cadangan Paket Pro tersimpan online dan bisa dipulihkan dari Pengaturan.",
  "settings.adPrivacy": "Privasi iklan",
  "settings.adPrivacySub": "Atur izin iklan dan preferensi privasi Anda.",
  "pkg.free.school": "1 sekolah",
  "pkg.free.students": "120 siswa",
  "pkg.free.classes": "5 kelas · mata pelajaran tanpa batas",
  "pkg.free.recap": "Rekap mingguan dan bulanan",
  "pkg.free.excel": "Unduh Excel",
  "pkg.free.local": "Data di HP",
  "pkg.free.ads": "Ada iklan",
  "pkg.pro.school": "Sekolah tanpa batas",
  "pkg.pro.classes":
    "Kelas tanpa batas per sekolah · mata pelajaran tanpa batas",
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
  "nav.tabManageSubjects": "Mata Pelajaran",
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
  "nav.journalRecap": "Rekap jurnal",
  "nav.teachingJournal": "Jurnal mengajar",
  "nav.studentNotes": "Catatan siswa",
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
  "nav.sessionSection": "Pertemuan",
  "nav.guide": "Panduan penggunaan",
  "nav.guideSub": "Ulangi panduan fitur aplikasi",
  "nav.allClasses": "Semua kelas",
  "classPicker.subjects": "Pilih kelas untuk mengelola mata pelajarannya.",
  "classPicker.students": "Pilih kelas untuk mengelola daftar siswanya.",
  "classPicker.tapToOpen": "Buka kelas",
  "manage.hubHint":
    "Kelola data kelas, mata pelajaran, siswa, dan predikat nilai di sini.",
  "manage.hubClasses": "Kelas",
  "manage.hubClassesSub": "Tambah, ubah, atau hapus kelas",
  "manage.hubSubjects": "Mata pelajaran",
  "manage.hubSubjectsSub": "Kelola mata pelajaran per kelas",
  "manage.hubStudents": "Siswa",
  "manage.hubStudentsSub": "Kelola daftar siswa per kelas",
  "manage.hubGradePredikat": "Predikat nilai",
  "manage.hubGradePredikatSub": "Label dan ambang batas predikat rekap",
  "manage.hubStudentSort": "Urutan siswa",
  "manage.hubStudentSortSub": "Urutkan daftar siswa berdasarkan nama atau NIS",
  "studentSort.title": "Urutan siswa",
  "studentSort.desc":
    "Pengaturan ini memengaruhi urutan siswa di absensi, penilaian, daftar siswa, dan rekap.",
  "studentSort.section": "Urutkan berdasarkan",
  "studentSort.byName": "Nama",
  "studentSort.byNis": "NIS",
  "studentSort.hint":
    "Siswa tanpa NIS tetap ditampilkan di akhir saat urutan NIS dipilih.",
  "studentSort.saved": "Urutan siswa tersimpan.",
  "students.tapToEdit": "Ketuk untuk ubah data siswa",
  "settings.restorePurchaseHint":
    "Sudah berlangganan di perangkat lain? Pulihkan pembelian setelah login.",
  "home.hubHint": "Pilih fitur yang ingin Anda gunakan.",
  "home.hubAttendanceSub": "Isi absensi harian per kelas atau mata pelajaran",
  "home.hubGradesSub": "Input nilai tugas dan lihat rekap penilaian",
  "home.hubTeachingJournalSub":
    "Catat materi, metode, dan catatan setiap pertemuan",
  "home.hubStudentNotesSub": "Catat perkembangan siswa di luar nilai akademik",
  "home.noModulesHint":
    "Belum ada fitur aktif. Aktifkan fitur di tab Pengaturan.",
  "home.tapClassForAttendance": "Isi absensi kelas ini",
  "home.tapClassForGrades": "Isi nilai kelas ini",
  "home.tapClassPickModule": "Absensi & penilaian",
  "home.openManageSub":
    "Kelas, mata pelajaran, siswa, predikat nilai, dan peng-urutan siswa.",
  "home.classModuleHint": "Pilih fitur untuk kelas ini.",
  "home.startSessionTitle": "Mulai pertemuan",
  "home.startSessionSub":
    "Absensi → jurnal → nilai (opsional) → catatan siswa (opsional)",
  "home.directModuleSection": "Akses langsung",
  "home.recapTitle": "Rekap",
  "home.recapSub": "Lihat rekap absensi, nilai, dan jurnal mengajar",
  "home.recapPickerTitle": "Pilih rekap",
  "home.recapPickerSub": "Absensi, nilai, atau jurnal mengajar",
  "home.sessionFlowHint":
    "Mulai pertemuan untuk alur berurutan, atau pilih fitur di bawah untuk langsung ke tujuan.",
  "home.classesSessionHint":
    "Ketuk kelas untuk mulai pertemuan atau buka fitur langsung.",
  "home.classesSessionSubjectHint":
    "Ketuk kelas untuk mulai pertemuan atau pilih fitur per mata pelajaran.",
  "home.tapClassStartSession": "Mulai pertemuan",
  "sessionFlow.progressTitle": "Progres pertemuan",
  "sessionFlow.stepShortAttendance": "Absensi",
  "sessionFlow.stepShortJournal": "Jurnal",
  "sessionFlow.stepShortGrades": "Nilai",
  "sessionFlow.stepShortNotes": "Catatan",
  "sessionFlow.optional": "opsional",
  "sessionFlow.afterAttendanceTitle": "Lanjut isi jurnal?",
  "sessionFlow.afterAttendanceBody":
    "Absensi tersimpan. Isi jurnal mengajar untuk pertemuan ini?",
  "sessionFlow.continueJournal": "Isi jurnal",
  "sessionFlow.skipJournal": "Langsung ke nilai",
  "sessionFlow.afterJournalTitle": "Ada tugas/ulangan?",
  "sessionFlow.afterJournalBody":
    "Jurnal tersimpan. Input nilai untuk pertemuan ini?",
  "sessionFlow.continueGrades": "Input nilai",
  "sessionFlow.skip": "Lewati",
  "sessionFlow.afterGradesTitle": "Ada siswa perlu dicatat?",
  "sessionFlow.afterGradesBody":
    "Tambahkan catatan perkembangan siswa untuk pertemuan ini?",
  "sessionFlow.continueStudentNotes": "Pilih siswa",
  "sessionFlow.done": "Selesai",
  "sessionFlow.afterNoteTitle": "Catatan tersimpan",
  "sessionFlow.afterNoteBody":
    "Pilih siswa lain atau selesaikan pertemuan ini.",
  "sessionFlow.pickAnotherStudent": "Siswa lain",
  "sessionFlow.finishSession": "Selesai pertemuan",
  "sessionFlow.nextStep": "Selanjutnya",
  "home.classesHint": "Ketuk kelas untuk absensi atau penilaian.",
  "home.classesSubjectHint":
    "Ketuk kelas untuk memilih mata pelajaran, lalu absensi atau penilaian.",
  "home.classesAttendanceHint": "Ketuk kelas untuk mengisi absensi.",
  "home.classesSubjectAttendanceHint":
    "Ketuk kelas, pilih mata pelajaran, lalu isi absensi.",
  "home.classesGradesHint": "Ketuk kelas untuk mengisi nilai.",
  "home.classesSubjectGradesHint":
    "Ketuk kelas, pilih mata pelajaran, lalu isi nilai.",
  "home.classesJournalHint": "Ketuk kelas untuk mengisi jurnal mengajar.",
  "home.classesSubjectJournalHint":
    "Ketuk kelas, pilih mata pelajaran, lalu isi jurnal.",
  "home.classesStudentNotesHint":
    "Ketuk kelas, pilih siswa, lalu tambahkan catatan.",
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
  "home.moduleSubjectJournalHint": "Ketuk mata pelajaran untuk mengisi jurnal.",
  "home.tapSubjectForAttendance": "Isi absensi mata pelajaran ini",
  "home.tapSubjectForGrades": "Isi nilai mata pelajaran ini",
  "home.tapSubjectForJournal": "Isi jurnal mata pelajaran ini",
  "modules.attendance": "Absensi",
  "modules.grades": "Penilaian",
  "modules.teachingJournal": "Jurnal mengajar",
  "modules.studentNotes": "Catatan siswa",
  "teachingJournal.saved": "Jurnal mengajar tersimpan.",
  "teachingJournal.hint":
    "Catat kegiatan pembelajaran per pertemuan. Terkait tanggal dan kelas yang sama dengan absensi dan penilaian.",
  "teachingJournal.fillRequired":
    "Isi minimal satu kolom (materi, metode, atau catatan) sebelum menyimpan.",
  "teachingJournal.material": "Materi pembelajaran",
  "teachingJournal.method": "Metode pembelajaran",
  "teachingJournal.notes": "Catatan",
  "teachingJournal.materialPlaceholder":
    "Contoh: Persamaan linear satu variabel",
  "teachingJournal.methodPlaceholder": "Contoh: Diskusi kelompok, LKPD",
  "teachingJournal.notesPlaceholder": "Catatan tambahan untuk pertemuan ini",
  "studentNotes.group.positive": "Positif",
  "studentNotes.group.academic": "Akademik",
  "studentNotes.group.attendance": "Kehadiran",
  "studentNotes.group.attitude": "Sikap",
  "studentNotes.group.other": "Lainnya",
  "studentNotes.preset.active_questions": "Aktif bertanya",
  "studentNotes.preset.helps_friends": "Membantu teman",
  "studentNotes.preset.discipline": "Disiplin",
  "studentNotes.preset.needs_remedial": "Perlu remedial",
  "studentNotes.preset.needs_support": "Perlu pendampingan",
  "studentNotes.preset.understands_well": "Memahami materi dengan baik",
  "studentNotes.preset.often_late": "Sering terlambat",
  "studentNotes.preset.absent_unexcused": "Tidak hadir tanpa keterangan",
  "studentNotes.preset.lacks_focus": "Kurang fokus saat pembelajaran",
  "studentNotes.preset.disrupts_peers": "Mengganggu teman",
  "studentNotes.preset.good_attitude": "Sikap baik",
  "studentNotes.otherOption": "Lainnya — isi sendiri",
  "studentNotes.otherLabel": "Catatan",
  "studentNotes.otherPlaceholder": "Tulis catatan khusus untuk siswa ini…",
  "studentNotes.optionLabel": "Pilih catatan",
  "studentNotes.selectRequired": "Pilih salah satu jenis catatan.",
  "studentNotes.otherRequired": "Isi catatan wajib diisi.",
  "studentNotes.saved": "Catatan siswa tersimpan.",
  "studentNotes.deleteTitle": "Hapus catatan?",
  "studentNotes.deleteBody": "Catatan ini akan dihapus permanen.",
  "studentNotes.deleteAction": "Hapus",
  "studentNotes.save": "Simpan catatan",
  "studentNotes.hint":
    "Pilih jenis catatan untuk siswa ini. Gunakan Lainnya jika perlu menulis catatan khusus.",
  "studentNotes.addSection": "Catatan baru",
  "studentNotes.historySection": "Riwayat catatan",
  "studentNotes.empty": "Belum ada catatan untuk siswa ini.",
  "studentNotes.tapToOpen": "Ketuk untuk buka catatan",
  "studentNotes.tapToAdd": "Ketuk untuk menambah catatan",
  "studentNotes.classHint": "Pilih siswa untuk menambah atau melihat catatan.",
  "common.optional": "Opsional",
  "common.loginFailed": "Gagal masuk.",
  "common.menu": "Menu",
  "workspace.pickSchool": "Pilih sekolah",
  "workspace.addSchool": "Tambah sekolah",
  "workspace.emptyTitle": "Belum ada sekolah",
  "workspace.emptyBody": "Tambahkan sekolah pertama untuk mulai mengajar.",
  "workspace.notLinkedSchoolHint":
    "Belum ada sekolah. Ketuk Tambah sekolah untuk membuat sekolah pertama.",
  "workspace.manualPickHint":
    "Pilih sekolah dari daftar, atau ketuk Tambah sekolah untuk lembaga lain.",
  "workspace.freeLimitTitle": "Batas paket gratis tercapai",
  "workspace.freeLimitBody":
    "Batas paket gratis sudah tercapai. Paket Pro membuka sekolah tanpa batas.",
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
  "onboarding.welcome.title": "Selamat datang di Catatan Guru",
  "onboarding.welcome.body":
    "Catat absensi, nilai, jurnal, dan catatan siswa dalam satu aplikasi sederhana.",
  "onboarding.storage.title": "Data tersimpan di HP Anda",
  "onboarding.storage.body":
    "Data harian bisa dipakai tanpa internet. Paket Pro menambah cadangan online saat Anda membutuhkannya.",
  "onboarding.storage.bullet1":
    "Paket gratis: 1 sekolah, 5 kelas, 120 siswa, rekap mingguan/bulanan, unduh Excel, ada iklan",
  "onboarding.storage.bullet2":
    "Paket Pro: sekolah, kelas, dan siswa tanpa batas, rekap semester, cadangan online, tanpa iklan",
  "onboarding.school.title": "Sekolah Anda",
  "onboarding.school.body":
    "Tambahkan sekolah pertama Anda, lalu pilih cara absensi yang paling cocok.",
  "onboarding.school.bullet1": "Absensi bisa per kelas atau per mata pelajaran",
  "onboarding.school.bullet2":
    "Mengajar di beberapa sekolah? Paket Pro membuka sekolah tanpa batas",
  "onboarding.schoolLink.title": "Beberapa sekolah",
  "onboarding.schoolLink.body":
    "Mengajar di lebih dari satu lembaga? Tambahkan sekolah terpisah untuk masing-masing.",
  "onboarding.schoolLink.bullet1":
    "Setiap sekolah punya kelas, siswa, dan rekap sendiri",
  "onboarding.schoolLink.bullet2":
    "Ganti sekolah lewat menu Ganti sekolah di Beranda",
  "onboarding.schoolLink.bullet3":
    "Paket Pro membuka sekolah tanpa batas di satu HP",
  "onboarding.class.title": "Kelas & siswa",
  "onboarding.class.body":
    "Tambahkan kelas, mata pelajaran, dan siswa sekali saja. Setelah itu, kegiatan harian lebih cepat.",
  "onboarding.class.bullet1": "Kelola kelas, mata pelajaran, dan daftar siswa",
  "onboarding.class.bullet2": "Buka kelas dari Beranda untuk mulai mengajar",
  "onboarding.class.bullet3": "Urutan siswa dan warna kelas bisa disesuaikan",
  "onboarding.modules.title": "Fitur yang Anda pakai",
  "onboarding.modules.body":
    "Pilih fitur yang ingin ditampilkan di aplikasi. Anda bisa mengubahnya nanti.",
  "onboarding.modules.settingsHint":
    "Pilihan ini bisa diubah kapan saja di menu Pengaturan → Fitur.",
  "onboarding.session.title": "Mulai pertemuan",
  "onboarding.session.body":
    "Dari list modul kelas, ketuk Mulai pertemuan untuk alur berurutan dalam satu sesi mengajar.",
  "onboarding.session.bullet1":
    "Absensi → jurnal → nilai → catatan siswa (sesuai fitur yang aktif)",
  "onboarding.session.bullet2":
    "Setelah simpan, lanjut ke langkah berikutnya; progres terlihat di atas layar",
  "onboarding.session.bullet3":
    "Setiap fitur juga bisa dibuka langsung dari list modul tanpa alur pertemuan",
  "onboarding.attendance.title": "Kegiatan harian",
  "onboarding.attendance.body":
    "Pilih kelas, lalu catat hal yang terjadi pada pertemuan hari ini.",
  "onboarding.attendance.bullet1":
    "Absensi: tandai hadir, sakit, izin, atau alpha",
  "onboarding.attendance.bullet2": "Nilai: tambah tugas lalu isi nilai siswa",
  "onboarding.attendance.bullet3":
    "Jurnal dan catatan siswa bisa diisi bila diperlukan",
  "onboarding.grades.title": "Nilai tugas",
  "onboarding.grades.body":
    "Catat nilai ulangan, PR, atau tugas lain per kelas atau mata pelajaran.",
  "onboarding.grades.bullet1":
    "Beranda → Nilai → pilih kelas (dan mata pelajaran jika per mata pelajaran)",
  "onboarding.grades.bullet2":
    "Tambah tugas, isi nilai tiap siswa di kolom kanan, lalu Simpan",
  "onboarding.grades.bullet3":
    "Menu ⋮ → Rekap nilai; atur predikat di Pengaturan jika perlu",
  "onboarding.more.title": "Rekap & cadangan",
  "onboarding.more.body":
    "Saat data sudah terisi, rekap dan unduh Excel bisa dibuat kapan saja.",
  "onboarding.more.bullet1": "Rekap absensi, nilai, dan jurnal",
  "onboarding.more.bullet2": "Unduh Excel untuk laporan",
  "onboarding.more.bullet3":
    "Paket Pro membuka rekap semester dan cadangan online",
  "onboarding.more.bullet4":
    "Fitur yang tidak dipakai bisa dimatikan di Pengaturan",
  "onboarding.startStep.title": "Siap memulai",
  "onboarding.startStep.body": "Mulai dengan menambah sekolah pertama Anda.",
  "onboarding.startStep.bullet1":
    "Data harian di HP; cadangan online hanya dengan paket Pro",
  "createWorkspace.nameRequired": "Nama sekolah wajib diisi.",
  "createWorkspace.levelRequired": "Jenjang wajib dipilih.",
  "createWorkspace.cityRequired": "Kota wajib diisi.",
  "createWorkspace.hint":
    "Paket gratis mendukung 1 sekolah dan 5 kelas. Paket Pro membuka sekolah dan kelas tanpa batas.",
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
  "quota.unlimitedSubjects": "mata pelajaran tanpa batas",
  "quota.classesSubjects": "kelas & mata pelajaran tanpa batas",
  "settings.proActivateFailed": "Gagal mengaktifkan Pro.",
  "menu.settings": "Pengaturan",
  "menu.switchSchool": "Ganti sekolah",
  "menu.signOut": "Keluar dari akun",
  "classMenu.weeklyRecap": "Rekap mingguan",
  "classMenu.editOrDelete": "Ubah atau hapus kelas",
  "ads.sponsorTitle": "Dukungan sponsor",
  "ads.placement.attendanceSaved":
    "Absensi tersimpan. Terima kasih sudah memakai versi gratis Catatan Guru.",
  "ads.placement.gradeSaved":
    "Nilai tersimpan. Terima kasih sudah memakai versi gratis Catatan Guru.",
  "ads.placement.recapExport":
    "Unduh rekap berhasil. Terima kasih sudah memakai versi gratis Catatan Guru.",
  "ads.placement.syncComplete":
    "Cadangan selesai. Terima kasih sudah memakai versi gratis Catatan Guru.",
  "ads.placement.default":
    "Terima kasih sudah memakai versi gratis Catatan Guru.",
  "ads.mockLabel": "Ruang iklan",
  "ads.mockSub":
    "Iklan jarang ditampilkan dan tidak muncul saat mengisi absensi atau nilai.",
  "ads.continue": "Lanjut",
  "ads.upgradeProNoAds": "Paket Pro · tanpa iklan",
  "ads.bannerHint": "Dukungan iklan membantu Catatan Guru tetap gratis.",
  "ads.upgradeShort": "Paket Pro · tanpa iklan",
  "export.shareRecap": "Unduh rekap Excel",
  "export.shareGradeRecap": "Unduh rekap nilai Excel",
  "export.shareJournalRecap": "Unduh rekap jurnal Excel",
  "export.shareGradeHistory": "Unduh riwayat nilai Excel",
  "export.noData": "Tidak ada data untuk diunduh.",
  "export.semesterRecapPro": "Unduh rekap semester tersedia di Paket Pro.",
  "export.semesterGradePro": "Unduh nilai semester tersedia di Paket Pro.",
  "export.semesterJournalPro": "Unduh jurnal semester tersedia di Paket Pro.",
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
    "Catatan Guru perlu izin menyimpan file Excel ke penyimpanan perangkat Anda.",
  "export.storagePermissionDenied":
    "Izin penyimpanan ditolak. Anda masih bisa mencoba lewat menu bagikan setelah file dibuat.",
  "student.quotaAtMax":
    "Batas {max} siswa sudah tercapai. Paket Pro membuka siswa tanpa batas.",
  "error.notSignedIn": "Belum login.",
  "error.noServerResponse":
    "Tidak ada respons. Periksa koneksi internet lalu coba lagi.",
  "error.serverInvalidResponse":
    "Terjadi gangguan. Coba lagi atau perbarui aplikasi.",
  "error.connectionFailed":
    "Tidak bisa terhubung. Periksa koneksi internet lalu coba lagi.",
  "error.requestFailed": "Permintaan gagal.",
  "error.schoolClassesLoadFailed":
    "Gagal memuat kelas. Tarik layar ke bawah untuk memperbarui.",
  "error.schoolGradesLoadFailed":
    "Gagal memuat nilai. Tarik layar ke bawah untuk memperbarui.",
  "error.schoolGradesSaveFailed":
    "Gagal menyimpan nilai. Periksa koneksi lalu coba lagi.",
  "error.schoolGradeRecapLoadFailed":
    "Gagal memuat rekap nilai. Tarik layar ke bawah untuk refresh.",
  "error.generic": "Terjadi kesalahan. Coba lagi.",
  "cloud.needPro":
    "Aktifkan Paket Pro dulu untuk mencadangkan data secara online.",
  "cloud.nothingToBackup": "Tidak ada data di HP untuk dicadangkan.",
  "cloud.needProRestore":
    "Aktifkan Paket Pro dulu untuk memulihkan cadangan online.",
  "cloud.noBackupYet":
    "Belum ada cadangan online. Cadangkan dari HP lama terlebih dahulu.",
  "local.dbOpenFailed": "Data di HP gagal dibuka. Coba buka ulang aplikasi.",
  "local.freeSchoolLimit":
    "Batas paket gratis sudah tercapai. Paket Pro membuka sekolah tanpa batas.",
  "local.classLimitBody":
    "Batas {max} kelas untuk sekolah ini sudah tercapai. Paket Pro membuka kelas tanpa batas.",
  "cloud.restoreFailed": "Gagal memulihkan cadangan.",
  "iap.purchaseInProgress": "Pembelian masih diproses.",
  "workspace.schoolQuotaFull": "Batas {max} sekolah sudah tercapai.",
  "iap.cancelled": "Pembelian dibatalkan.",
  "iap.purchaseFailed": "Pembelian gagal.",
  "iap.tokenMissing":
    "Pembelian tidak dikenali. Coba pulihkan langganan atau hubungi dukungan.",
  "iap.noActiveSubscription":
    "Tidak ada Paket Pro aktif di akun Google Play ini.",
  "iap.openPlayFailed": "Tidak bisa membuka Google Play.",
  "iap.restoreFailed": "Gagal memulihkan pembelian.",
};

const en: Record<TranslationKey, string> = {
  "app.name": "Catatan Guru",
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
  "login.featureJournal": "Journal",
  "login.featureNotes": "Student Notes",
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
    "Google sign-in is not available right now. Try again later or use email and password.",
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
  "login.emailHint": "Use the email registered to your account.",
  "login.schoolLinkHint":
    "Catatan Guru helps with attendance and grades — per homeroom or per subject. Your time is better spent teaching than on admin work.",
  "classes.hintTitle": "Start from a class",
  "classes.hintBodyClass":
    "Use the attendance or grades button on each class. The other menu button opens students, reports, and class settings.",
  "classes.hintBodySubject":
    "Choose a class first, then choose a subject for attendance or grades.",
  "classes.tapToAttendance": "Take attendance",
  "classes.tapToSubjects": "Choose subject",
  "classes.tapToSubjectsGrades": "Subjects & grades",
  "classes.empty": "No classes yet. Tap + to add your first class.",
  "classes.emptySchool": "No classes yet. Tap + to add your first class.",
  "classes.hintBodySchool":
    "Manage classes and students in Manage, then take attendance and enter grades from Home.",
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
  "subjects.addStudentPrompt":
    "Add students first to start a session or open this module.",
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
  "grades.scoreRequired": "Enter at least one student score before saving.",
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
    "Grade bands are locked for linked schools — managed by admin.",
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
  "studentNotesDetail.title": "Note history",
  "studentNotesDetail.history": "Note history",
  "studentNotesDetail.empty": "No notes recorded for this student yet.",
  "studentNotesDetail.records": "{count} notes recorded",
  "journalRecap.empty": "No teaching journal entries in this period.",
  "journalRecap.sessionsRecorded": "{count} sessions recorded",
  "students.hint":
    "Tap the attendance or grade icon to view a student's history. Use ⋯ to edit their profile.",
  "students.hintSchool":
    "Manage students in Manage. Tap attendance or grade icons for history.",
  "students.manageHint":
    "Manage students in this class. Tap a student to edit or delete them.",
  "school.readonlyTitle": "Managed by school admin",
  "school.noStudentsHint":
    "No students in this class yet. Tap + to add a student.",
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
  "recap.chartAttendance": "Attendance chart",
  "recap.chartGrades": "Grade band chart",
  "recap.chartAttendanceTrend": "Weekly attendance trend",
  "recap.chartGradesTrend": "Weekly average score trend",
  "recap.chartAttendanceSemesterTrend": "Monthly attendance trend (semester)",
  "recap.chartGradesSemesterTrend": "Monthly average score trend (semester)",
  "recap.chartEmpty": "No data for chart yet",
  "recap.periodWeekly": "Weekly",
  "recap.periodMonthly": "Monthly",
  "recap.periodSemester": "Semester",
  "recap.periodLabel": "Period",
  "recap.choosePeriod": "Choose period",
  "recap.segmentWeekly": "Week",
  "recap.segmentMonthly": "Month",
  "recap.segmentSemester": "Semester",
  "recap.tabChart": "Charts",
  "recap.tabTable": "Table",
  "recap.chartHeroAttendance": "Attendance rate",
  "recap.chartHeroAttendanceHint": "From {count} attendance records",
  "recap.chartHeroGrade": "Class average",
  "recap.chartHeroGradeHint": "Based on {count} graded students",
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
  "student.quotaTitle": "Student limit",
  "student.quotaUsage": "{used} of {max} students",
  "student.quotaPro": "{count} students · no limit",
  "student.quotaLimit":
    "Free plan student limit reached. Pro unlocks unlimited students.",
  "student.fullName": "Full name",
  "student.number": "Student ID (optional)",
  "student.nameRequired": "Student name is required.",
  "student.classLabel": "Class {name}",
  "student.deleteTitle": "Delete student?",
  "student.deleteBody":
    "The student will be deactivated and no longer counts toward your student limit.",
  "student.deleteAction": "Delete student",
  "about.title": "About Catatan Guru",
  "about.subtitle": "Attendance & grades per class or subject — on your phone.",
  "about.whatIs": "What is it?",
  "about.whatIsBody":
    "Track attendance, grades, teaching journals, student notes, and reports by class or subject — right from your phone.",
  "about.howToUse": "Quick start",
  "about.step1": "Pick or create a school first",
  "about.step2": "Manage tab: classes, subjects, and students",
  "about.step3": "Home tab: daily attendance & grades per class",
  "about.step4": "Weekly/monthly reports and Excel download",
  "about.featuresTitle": "More features",
  "about.featureGrades":
    "Task scores, grade reports, band filters, Excel export.",
  "about.featurePredikat":
    "Set grade band labels and score thresholds in Settings → Grade bands.",
  "about.featureSchoolLink":
    "Teaching journal per session and student notes — enable features in Settings.",
  "about.featureCloud":
    "Pro plan: back up online and restore when you change phones via Settings → Online backup.",
  "about.plansHint":
    "Free vs Pro plan details are in Settings → Plan & subscription.",
  "about.schoolHint":
    "Teach at multiple schools? Add a separate school for each institution.",
  "about.footer": "Catatan Guru",
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
  "settings.about": "About Catatan Guru",
  "settings.aboutSub": "Short app guide",
  "settings.switchSchoolProSub": "Switch school or add a new one",
  "settings.modulesSection": "Features",
  "settings.gradePredikatSection": "Grades",
  "settings.gradePredikat": "Grade bands",
  "settings.gradePredikatSub": "Labels and score thresholds for grade recap",
  "settings.helpSection": "Help",
  "settings.moduleAttendance": "Attendance",
  "settings.moduleGrades": "Grades",
  "settings.moduleTeachingJournal": "Teaching journal",
  "settings.moduleStudentNotes": "Student notes",
  "settings.modulesHint":
    "Turn on the features you use. At least one feature must stay on.",
  "settings.modulesMinOne": "At least one feature must stay enabled.",
  "settings.package": "Plan & subscription",
  "settings.packageIntro":
    "Daily data stays on your phone. Pro adds online backup and advanced features.",
  "settings.freePlanLead":
    "Free plan includes 1 school, 5 classes, up to 120 students, weekly/monthly reports, and light ads.",
  "settings.freePlanBadge": "Free",
  "settings.freeIncludesTitle": "Free plan includes:",
  "settings.proPlanLead":
    "Pro is active — unlimited schools, classes, and students; semester reports; online backup; no ads.",
  "settings.proUnlockTitle": "Pro unlocks:",
  "settings.proIncludesTitle": "Pro includes:",
  "settings.proUpgradeHint":
    "Subscribe via Google Play. When you change phones, Pro can be transferred from Settings.",
  "settings.proDevUnlockHint": "Test mode: Pro is enabled for app development.",
  "settings.subscribeAlertTitle": "Activate Pro",
  "settings.subscribeAlertBody":
    "Daily data stays on your phone. Pro adds:\n\n• Unlimited schools, classes, and students\n• Semester reports\n• Automatic online backup\n• Restore data when you change phones\n• No ads\n\nContinue to Google Play?",
  "settings.subscribeAlertBodyAndroid":
    "Daily data stays on your phone. Pro adds unlimited schools, classes, and students; semester reports; online backup; and no ads.\n\n{price}\n\nContinue to Google Play?",
  "settings.restorePurchase": "Restore subscription",
  "settings.restoreNotFound":
    "No subscription found for this account. Make sure you are signed in with the same account used to subscribe.",
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
  "settings.upgradePro": "Activate Pro",
  "settings.proActive": "Pro active",
  "settings.proDeviceConflict": "Pro is active on another device",
  "settings.proDeviceConflictBody":
    "Pro is active on {device}. Transfer to this phone if this is your account.",
  "settings.proDeviceUnknown": "another device",
  "settings.transferDevice": "Transfer to this phone",
  "settings.transferDeviceConfirm":
    "Pro will work on this phone and stop on the old device for online backup. Continue?",
  "settings.transferDeviceSuccess": "Pro transferred to this phone.",
  "settings.cloud": "Online backup",
  "settings.cloudIntro":
    "Pro only: copy your data to secure online backup, then restore when you switch phones.",
  "settings.sync": "Back up now",
  "settings.syncDesc":
    "Upload schools, classes, students, attendance, grades, journal, and student notes to online backup.",
  "settings.restore": "Restore backup",
  "settings.restoreDesc":
    "Replace this phone's data with the latest online backup. Current data will be overwritten.",
  "settings.cloudHint": "Online backup is available on the Pro plan.",
  "settings.autoCloudSync": "Automatic backup",
  "settings.autoCloudSyncHint":
    "Data is backed up periodically when the app is active and after changes. On by default for Pro.",
  "workspace.badgeSchool": "Linked",
  "workspace.badgeLocal": "On your phone",
  "workspace.badgeLocalArchive": "Older data",
  "workspace.localArchiveHint":
    "Older data with the same school name — open for reports and Excel downloads.",
  "workspace.localArchiveBanner":
    "Local archive on your phone. Reports and downloads still work.",
  "workspace.openLocalArchive": "Older data",
  "workspace.openLocalArchiveBody": "{count} school(s) · older data",
  "workspace.localArchiveScreenTitle": "Older data",
  "workspace.localArchiveScreenHint":
    "Older on-device data. Reports and downloads still work.",
  "workspace.localArchiveCount": "{count} archive(s) available",
  "workspace.localArchiveEmptyTitle": "No archives",
  "workspace.localArchiveEmptyBody":
    "An archive appears if you saved local data with the same school name before.",
  "createWorkspace.linkedSchoolExists":
    "This school is already in your list. Pick it from the list instead of adding a duplicate.",
  "settings.danger": "Delete data",
  "settings.wipe": "Delete data on this phone",
  "settings.wipeHint":
    "Removes classes, students, attendance, grades, journal, and notes on this phone. Your account is not deleted.",
  "settings.dataHint":
    "Daily data stays on your phone. Pro backups are stored online and can be restored from Settings.",
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
  "nav.journalRecap": "Journal recap",
  "nav.teachingJournal": "Teaching journal",
  "nav.studentNotes": "Student notes",
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
  "manage.hubGradePredikat": "Grade bands",
  "manage.hubGradePredikatSub": "Labels and score thresholds for grade recap",
  "manage.hubStudentSort": "Student order",
  "manage.hubStudentSortSub": "Sort student lists by name or student ID",
  "studentSort.title": "Student order",
  "studentSort.desc":
    "This affects student order in attendance, grades, student lists, and recaps.",
  "studentSort.section": "Sort by",
  "studentSort.byName": "Name",
  "studentSort.byNis": "Student ID",
  "studentSort.hint":
    "Students without an ID appear at the end when sorting by ID.",
  "studentSort.saved": "Student order saved.",
  "students.tapToEdit": "Tap to edit student",
  "settings.restorePurchaseHint":
    "Already subscribed on another device? Restore your purchase after signing in.",
  "home.hubHint": "Choose a module to get started.",
  "home.hubAttendanceSub": "Take daily attendance by class or subject",
  "home.hubGradesSub": "Enter task grades and view grade reports",
  "home.hubTeachingJournalSub":
    "Record material, method, and notes for each session",
  "home.hubStudentNotesSub": "Track student progress beyond academic grades",
  "home.noModulesHint": "No modules are active. Enable modules in Settings.",
  "home.tapClassForAttendance": "Take attendance for this class",
  "home.tapClassForGrades": "Enter grades for this class",
  "home.tapClassPickModule": "Attendance & grades",
  "home.openManageSub": "Classes, subjects, and students",
  "home.classModuleHint": "Choose a module for this class.",
  "home.startSessionTitle": "Start session",
  "home.startSessionSub":
    "Attendance → journal → grades (optional) → student notes (optional)",
  "home.directModuleSection": "Open module directly",
  "home.recapTitle": "Reports",
  "home.recapSub": "View attendance, grade, and teaching journal reports",
  "home.recapPickerTitle": "Choose report",
  "home.recapPickerSub": "Attendance, grades, or teaching journal",
  "home.sessionFlowHint":
    "Start a session for the step-by-step flow, or pick a module below to jump in.",
  "home.classesSessionHint":
    "Tap a class to start a session or open a module directly.",
  "home.classesSessionSubjectHint":
    "Tap a class to start a session or pick a module by subject.",
  "home.tapClassStartSession": "Start session",
  "sessionFlow.progressTitle": "Session progress",
  "sessionFlow.stepShortAttendance": "Att",
  "sessionFlow.stepShortJournal": "Jrn",
  "sessionFlow.stepShortGrades": "Grd",
  "sessionFlow.stepShortNotes": "Nte",
  "sessionFlow.optional": "optional",
  "sessionFlow.afterAttendanceTitle": "Continue to journal?",
  "sessionFlow.afterAttendanceBody":
    "Attendance saved. Fill in the teaching journal for this session?",
  "sessionFlow.continueJournal": "Open journal",
  "sessionFlow.skipJournal": "Go to grades",
  "sessionFlow.afterJournalTitle": "Any homework or test?",
  "sessionFlow.afterJournalBody":
    "Journal saved. Enter grades for this session?",
  "sessionFlow.continueGrades": "Enter grades",
  "sessionFlow.skip": "Skip",
  "sessionFlow.afterGradesTitle": "Any students to note?",
  "sessionFlow.afterGradesBody": "Add student progress notes for this session?",
  "sessionFlow.continueStudentNotes": "Pick student",
  "sessionFlow.done": "Done",
  "sessionFlow.afterNoteTitle": "Note saved",
  "sessionFlow.afterNoteBody": "Pick another student or finish this session.",
  "sessionFlow.pickAnotherStudent": "Another student",
  "sessionFlow.finishSession": "Finish session",
  "sessionFlow.nextStep": "Next",
  "home.classesHint": "Tap a class for attendance or grades.",
  "home.classesSubjectHint":
    "Tap a class, pick a subject, then take attendance or enter grades.",
  "home.classesAttendanceHint": "Tap a class to take attendance.",
  "home.classesSubjectAttendanceHint":
    "Tap a class, pick a subject, then take attendance.",
  "home.classesGradesHint": "Tap a class to enter grades.",
  "home.classesSubjectGradesHint":
    "Tap a class, pick a subject, then enter grades.",
  "home.classesJournalHint": "Tap a class to open the teaching journal.",
  "home.classesSubjectJournalHint":
    "Tap a class, pick a subject, then fill in the journal.",
  "home.classesStudentNotesHint":
    "Tap a class, pick a student, then add notes.",
  "home.moduleClassesAttendanceHint":
    "Choose a class to take today's attendance.",
  "home.moduleClassesGradesHint": "Choose a class to enter grades.",
  "home.moduleClassesSubjectAttendanceHint":
    "Choose a class, then a subject for attendance.",
  "home.moduleClassesSubjectGradesHint":
    "Choose a class, then a subject for grades.",
  "home.moduleSubjectAttendanceHint": "Tap a subject to take attendance.",
  "home.moduleSubjectGradesHint": "Tap a subject to enter grades.",
  "home.moduleSubjectJournalHint": "Tap a subject to open the journal.",
  "home.tapSubjectForAttendance": "Take attendance for this subject",
  "home.tapSubjectForGrades": "Enter grades for this subject",
  "home.tapSubjectForJournal": "Open journal for this subject",
  "modules.attendance": "Attendance",
  "modules.grades": "Grades",
  "modules.teachingJournal": "Teaching journal",
  "modules.studentNotes": "Student notes",
  "teachingJournal.saved": "Teaching journal saved.",
  "teachingJournal.hint":
    "Record learning activities per session. Linked to the same date and class as attendance and grades.",
  "teachingJournal.fillRequired":
    "Fill at least one field (material, method, or notes) before saving.",
  "teachingJournal.material": "Learning material",
  "teachingJournal.method": "Teaching method",
  "teachingJournal.notes": "Notes",
  "teachingJournal.materialPlaceholder":
    "e.g. Linear equations in one variable",
  "teachingJournal.methodPlaceholder": "e.g. Group discussion, worksheet",
  "teachingJournal.notesPlaceholder": "Additional notes for this session",
  "studentNotes.group.positive": "Positive",
  "studentNotes.group.academic": "Academic",
  "studentNotes.group.attendance": "Attendance",
  "studentNotes.group.attitude": "Attitude",
  "studentNotes.group.other": "Other",
  "studentNotes.preset.active_questions": "Asks questions actively",
  "studentNotes.preset.helps_friends": "Helps classmates",
  "studentNotes.preset.discipline": "Disciplined",
  "studentNotes.preset.needs_remedial": "Needs remedial help",
  "studentNotes.preset.needs_support": "Needs extra support",
  "studentNotes.preset.understands_well": "Understands material well",
  "studentNotes.preset.often_late": "Often late",
  "studentNotes.preset.absent_unexcused": "Absent without notice",
  "studentNotes.preset.lacks_focus": "Lacks focus in class",
  "studentNotes.preset.disrupts_peers": "Disrupts classmates",
  "studentNotes.preset.good_attitude": "Good attitude",
  "studentNotes.otherOption": "Other — write your own",
  "studentNotes.otherLabel": "Note",
  "studentNotes.otherPlaceholder": "Write a custom note for this student…",
  "studentNotes.optionLabel": "Pick a note",
  "studentNotes.selectRequired": "Pick one note type.",
  "studentNotes.otherRequired": "Note text is required.",
  "studentNotes.saved": "Student note saved.",
  "studentNotes.deleteTitle": "Delete note?",
  "studentNotes.deleteBody": "This note will be permanently deleted.",
  "studentNotes.deleteAction": "Delete",
  "studentNotes.save": "Save note",
  "studentNotes.hint":
    "Pick a note type for this student. Use Other for a custom note.",
  "studentNotes.addSection": "New note",
  "studentNotes.historySection": "Note history",
  "studentNotes.empty": "No notes for this student yet.",
  "studentNotes.tapToOpen": "Tap to open notes",
  "studentNotes.tapToAdd": "Tap to add a note",
  "studentNotes.classHint": "Pick a student to add or view notes.",
  "common.optional": "Optional",
  "common.loginFailed": "Sign-in failed.",
  "common.menu": "Menu",
  "workspace.pickSchool": "Choose school",
  "workspace.addSchool": "Add school",
  "workspace.emptyTitle": "No schools yet",
  "workspace.emptyBody": "Add your first school to start teaching.",
  "workspace.notLinkedSchoolHint":
    "No schools yet. Tap Add school to create your first school.",
  "workspace.manualPickHint":
    "Pick a school from the list, or tap Add school for another institution.",
  "workspace.freeLimitTitle": "Free plan limit reached",
  "workspace.freeLimitBody":
    "Free plan limit reached. Pro unlocks unlimited schools.",
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
  "onboarding.welcome.title": "Welcome to Catatan Guru",
  "onboarding.welcome.body":
    "Record attendance, grades, teaching journals, and student notes in one simple app.",
  "onboarding.storage.title": "Data stays on your phone",
  "onboarding.storage.body":
    "Daily work works offline. Pro adds online backup when you need it.",
  "onboarding.storage.bullet1":
    "Free: 1 school, 5 classes, 120 students, weekly & monthly reports, download Excel, includes ads",
  "onboarding.storage.bullet2":
    "Pro plan: unlimited schools, classes, and students, semester reports, online backup, no ads",
  "onboarding.school.title": "Your school",
  "onboarding.school.body":
    "Add your first school, then choose the attendance style that fits your teaching.",
  "onboarding.school.bullet1": "Attendance can be by class or by subject",
  "onboarding.school.bullet2":
    "Teach at multiple schools? Pro unlocks unlimited schools",
  "onboarding.schoolLink.title": "Multiple schools",
  "onboarding.schoolLink.body":
    "Teach at more than one institution? Add a separate school for each one.",
  "onboarding.schoolLink.bullet1":
    "Each school has its own classes, students, and reports",
  "onboarding.schoolLink.bullet2": "Switch schools via Choose school on Home",
  "onboarding.schoolLink.bullet3": "Pro unlocks unlimited schools on one phone",
  "onboarding.class.title": "Classes & students",
  "onboarding.class.body":
    "Add classes, subjects, and students once. Daily teaching becomes faster after that.",
  "onboarding.class.bullet1": "Manage classes, subjects, and student lists",
  "onboarding.class.bullet2": "Open a class from Home to start teaching",
  "onboarding.class.bullet3": "Student order and class colors can be adjusted",
  "onboarding.modules.title": "Features you use",
  "onboarding.modules.body":
    "Choose which features appear in the app. You can change this later.",
  "onboarding.modules.settingsHint":
    "You can update these anytime in Settings → Features.",
  "onboarding.session.title": "Start a session",
  "onboarding.session.body":
    "From a class module list, tap Start session for a guided flow through one teaching period.",
  "onboarding.session.bullet1":
    "Attendance → journal → grades → student notes (based on enabled features)",
  "onboarding.session.bullet2":
    "After saving, continue to the next step; progress appears at the top",
  "onboarding.session.bullet3":
    "Each feature can also be opened directly from the module list",
  "onboarding.attendance.title": "Daily teaching",
  "onboarding.attendance.body":
    "Pick a class, then record what happened in today's session.",
  "onboarding.attendance.bullet1":
    "Attendance: mark present, sick, excused, or absent",
  "onboarding.attendance.bullet2":
    "Grades: add an assignment and fill student scores",
  "onboarding.attendance.bullet3":
    "Journal and student notes can be added when needed",
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
    "Once data is recorded, reports and Excel downloads are ready whenever you need them.",
  "onboarding.more.bullet1": "Attendance, grade, and journal reports",
  "onboarding.more.bullet2": "Download Excel for reports",
  "onboarding.more.bullet3": "Pro unlocks semester reports and online backup",
  "onboarding.more.bullet4": "Unused features can be turned off in Settings",
  "onboarding.startStep.title": "Ready to start",
  "onboarding.startStep.body": "Start by adding your first school.",
  "onboarding.startStep.bullet1":
    "Daily data stays on your phone; online backup is available with Pro",
  "createWorkspace.nameRequired": "School name is required.",
  "createWorkspace.levelRequired": "School level is required.",
  "createWorkspace.cityRequired": "City is required.",
  "createWorkspace.hint":
    "Free plan supports 1 school and 5 classes. Pro unlocks unlimited schools and classes.",
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
    "Attendance saved. Thanks for using the free version of Catatan Guru.",
  "ads.placement.gradeSaved":
    "Grades saved. Thanks for using the free version of Catatan Guru.",
  "ads.placement.recapExport":
    "Report downloaded. Thanks for using the free version of Catatan Guru.",
  "ads.placement.syncComplete":
    "Backup complete. Thanks for using the free version of Catatan Guru.",
  "ads.placement.default": "Thanks for using the free version of Catatan Guru.",
  "ads.mockLabel": "Ad space",
  "ads.mockSub":
    "Ads appear rarely and never while you are taking attendance or entering grades.",
  "ads.continue": "Continue",
  "ads.upgradeProNoAds": "Pro · no ads",
  "ads.bannerHint": "Ad support helps keep Catatan Guru free on your phone.",
  "ads.upgradeShort": "Pro · no ads",
  "export.shareRecap": "Download attendance report",
  "export.shareGradeRecap": "Download grade report",
  "export.shareJournalRecap": "Download journal report",
  "export.shareGradeHistory": "Download grade history",
  "export.noData": "Nothing to download yet.",
  "export.semesterRecapPro":
    "Semester attendance reports are available on Pro.",
  "export.semesterGradePro": "Semester grade reports are available on Pro.",
  "export.semesterJournalPro": "Semester journal reports are available on Pro.",
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
    "Catatan Guru needs permission to save Excel files to your device storage.",
  "export.storagePermissionDenied":
    "Storage permission denied. You can still try saving via the share menu after the file is created.",
  "student.quotaAtMax":
    "Limit of {max} students reached. Pro unlocks unlimited students.",
  "error.notSignedIn": "Not signed in.",
  "error.noServerResponse":
    "No response. Check your internet connection and try again.",
  "error.serverInvalidResponse":
    "Something went wrong. Try again or update the app.",
  "error.connectionFailed":
    "Could not connect. Check your internet connection and try again.",
  "error.requestFailed": "Request failed.",
  "error.schoolClassesLoadFailed":
    "Could not load classes. Pull down to refresh.",
  "error.schoolGradesLoadFailed":
    "Could not load grades. Pull down to refresh.",
  "error.schoolGradesSaveFailed":
    "Could not save grades. Check your connection and try again.",
  "error.schoolGradeRecapLoadFailed":
    "Could not load grade report. Pull down to refresh.",
  "error.generic": "Something went wrong. Please try again.",
  "cloud.needPro": "Activate Pro first to back up data online.",
  "cloud.nothingToBackup": "Nothing on this phone to back up yet.",
  "cloud.needProRestore": "Activate Pro first to restore an online backup.",
  "cloud.noBackupYet":
    "No online backup yet. Back up from your old phone first.",
  "local.dbOpenFailed":
    "Could not open data on this phone. Try reopening the app.",
  "local.freeSchoolLimit":
    "Free plan limit reached. Pro unlocks unlimited schools.",
  "local.classLimitBody":
    "Limit of {max} classes reached for this school. Pro unlocks unlimited classes.",
  "cloud.restoreFailed": "Could not restore backup.",
  "iap.purchaseInProgress": "Purchase still processing.",
  "workspace.schoolQuotaFull": "School limit reached (max {max} schools).",
  "iap.cancelled": "Purchase cancelled.",
  "iap.purchaseFailed": "Purchase failed.",
  "iap.tokenMissing":
    "Purchase not recognized. Try restoring your subscription or contact support.",
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
