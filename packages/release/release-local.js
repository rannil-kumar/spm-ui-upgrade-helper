const release = (shell, option, version) => {
  shell.echo(`Option: '${option}', Version: '${version}'`);
  let r;

  if(!version.match(/^\d+\.\d+\.\d+$/)) {
    shell.echo("ERROR: Version must match x.y.z format.");
    return 1;
  }

  if(option === "--start") {
    shell.echo("Building...");
    exec(shell, `yarn install`);
    exec(shell, `yarn test`);
    exec(shell, `echo { "version": "${version}" }>version.json`);
    exec(shell, `yarn build:release`);
    shell.echo("Creating release branch...");
    exec(shell, `git checkout -b v${version}`);
    exec(shell, `git push --set-upstream origin v${version}`);
    shell.echo("");
    shell.echo("Build successful. You should now perform acceptance testing. Use `yarn at:build` and `at.bat`/`at.sh` to test against generated acceptance test data.");
    shell.echo("");
    shell.echo(`Once acceptance testing is finished, use \`yarn release --ship ${version}\` to release.`);
    return 0;
  }

  if(option === "--ship") {
    shell.echo("Shipping...");
    exec(shell, "docker login wh-govspm-docker-local.artifactory.swg-devops.com");
    exec(shell, `yarn docker-tasks release ${version}`);
    exec(shell, `yarn docker-tasks release latest`);
    exec(shell, `yarn docker-tasks release ${version} --public`);
    exec(shell, `yarn docker-tasks release latest --public`);
    exec(shell, `git tag v${version}`);
    exec(shell, `git push --tags`);
    exec(shell, `rm -f version.json`);
    return 0;
  }

  shell.echo(`ERROR: Unknown option: '${option}'`);
  return 1;
}

const exec = (shell, cmd) => {
  const r = shell.exec(cmd);
  if(r.code != 0) { shell.exit(r.code); }
}

module.exports = release;