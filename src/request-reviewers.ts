import * as core from "@actions/core";
import * as github from "@actions/github";

class RequestReviewers {
  public async requestReviewers(): Promise<void> {
    const actor = github.context.actor;

    console.log(actor);
    console.log(github.context.issue);
    console.log(github.context.repo);
    console.log(github.context.issue);

    const teamMembers = await this.getTeamMembers();

    console.log(teamMembers);

    const shouldRequestReviewers = teamMembers.includes(actor);

    if (shouldRequestReviewers) {
      const octokit = github.getOctokit(this.getGithubToken());
      await octokit.rest.pulls.requestReviewers({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: github.context.issue.number,
        reviewers: teamMembers.filter((member) => member !== actor),
      });
    }
  }

  private async getTeamMembers(): Promise<string[]> {
    const octokit = github.getOctokit(this.getGithubToken());
    const org = github.context.repo.owner;

    const teams = core.getInput("teams").split(",");

    const teamMembers: string[] = [];

    for await (const team of teams) {
      const members = await octokit.rest.teams.listMembersInOrg({
        org,
        team_slug: team,
      });

      members.data.forEach((member) => {
        teamMembers.push(member.login);
      });
    }

    return teamMembers;
  }

  private getGithubToken(): string {
    return core.getInput("token");
  }
}

export { RequestReviewers };
