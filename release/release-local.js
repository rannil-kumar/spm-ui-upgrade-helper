const release = (shell, option, version) => {
  shell.echo(`Option: '${option}', Version: '${version}'`);
  let r;

  if(!version.match(/^\d+\.\d+\.\d+$/)) {
    shell.echo("ERROR: Version must match x.y.z format.");
    return 1;
  }

  if(option === "--start") {
    shell.echo("Creating release branch...");
    r = shell.exec(`git checkout -b v${version}`);
    if(r.code != 0) { shell.exit(r.code); }
    r = shell.exec(`git push --set-upstream origin v${version}`);
    if(r.code != 0) { shell.exit(r.code); }
    shell.echo("Building...");
    r = shell.exec(`yarn install`);
    if(r.code != 0) { shell.exit(r.code); }
    r = shell.exec(`yarn generate-files`);
    if(r.code != 0) { shell.exit(r.code); }
    r = shell.exec(`yarn docker-tasks build`);
    if(r.code != 0) { shell.exit(r.code); }
    return 0;
  }

  if(option === "--ship") {
    shell.echo("Shipping...");
    r = shell.exec("docker login wh-govspm-docker-local.artifactory.swg-devops.com");
    if(r.code != 0) { shell.exit(r.code); }
    r = shell.exec(`yarn docker-tasks release ${version}`);
    if(r.code != 0) { shell.exit(r.code); }
    r = shell.exec(`git tag v${version}`);
    if(r.code != 0) { shell.exit(r.code); }
    r = shell.exec(`git push --tags`);
    if(r.code != 0) { shell.exit(r.code); }
    return 0;
  }

  shell.echo(`ERROR: Unknown option: '${option}'`);
  return 1;
}

module.exports = release;