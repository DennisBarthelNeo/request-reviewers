import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/core";
import { Api } from "@octokit/plugin-rest-endpoint-methods/dist-types/types";

type TeamMembersInput = {
  octokit: Octokit & Api;
  org: string;
  teams: string[];
};

type RequestReviewersInput = {
  octokit: Octokit & Api;
  teamMembers: string[];
  actor: string;
};

class RequestReviewers {
  public async performAction(): Promise<void> {
    const actor = github.context.actor;
    const org = github.context.repo.owner;
    const octokit = github.getOctokit(this.getGithubToken());

    const teamMembers = await this.getTeamMembers({
      octokit,
      org,
      teams: this.getTeams(),
    });

    const shouldRequestReviewers = teamMembers.includes(actor);

    if (shouldRequestReviewers) {
      await this.requestReviewers({
        actor,
        octokit,
        teamMembers,
      });
    }
  }

  private async getTeamMembers(input: TeamMembersInput): Promise<string[]> {
    const { octokit, org } = input;

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

  private async requestReviewers(input: RequestReviewersInput): Promise<void> {
    const { actor, octokit, teamMembers } = input;

    const reviewers = teamMembers.filter((member) => member !== actor);

    await octokit.rest.pulls.requestReviewers({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.issue.number,
      reviewers,
    });
  }

  private getGithubToken(): string {
    return core.getInput("token");
  }

  private getTeams(): string[] {
    return core.getInput("teams").split(",");
  }
}

export { RequestReviewers };
