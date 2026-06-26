const { withProjectBuildGradle } = require("expo/config-plugins");

/**
 * play-services-ads 25.x dibuild dengan Kotlin 2.3+.
 * Flag ini aman saat beberapa modul masih pakai compiler Kotlin lebih lama.
 */
function withKotlinMetadataCompat(config) {
  return withProjectBuildGradle(config, (config) => {
    const marker = "catatan-guru-kotlin-metadata-compat";
    if (config.modResults.contents.includes(marker)) {
      return config;
    }

    const block = `
// ${marker}
subprojects { subproject ->
  subproject.tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
    compilerOptions {
      freeCompilerArgs.add("-Xskip-metadata-version-check")
    }
  }
}
`;

    config.modResults.contents += block;
    return config;
  });
}

module.exports = withKotlinMetadataCompat;
