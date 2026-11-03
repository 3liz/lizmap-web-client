#!/usr/bin/python3

import os
import requests

from typing import Optional

from packaging.version import Version, InvalidVersion

class MilestoneError(Exception):
    pass


def parse_branch(branch: str, milestones_available: list) -> Optional[Version]:
    """ Returns the milestones available according to the branch name, otherwise None. """
    if branch == 'master':
        return milestones_available[-1]

    try:
        branch = branch.replace('release_', '').replace('_', '.')
        branch = Version(branch)
        for m in milestones_available:
            if m.major == branch.major and m.minor == branch.minor:
                return m
    except Exception as e:
        print(e)

    return None

def all_gh_milestones(token: str, repo: str):
    r = requests.get(
        f"https://api.github.com/repos/{repo}/milestones",
        headers={
            'Authorization': f'Bearer {token}'
        }
    )
    if r.status_code != 200:
        raise MilestoneError(f"Milestone request returned {r.status_code}: {r.text}")

    milestones = r.json()
    github_valid_milestones = []
    for m in milestones:
        if len(m['title'].split('.')) != 3:
            continue
        try:
            github_valid_milestones.append(Version(m['title']))
        except InvalidVersion:
            continue
    github_valid_milestones.sort()
    return github_valid_milestones, milestones


if __name__ == "__main__":
    token = os.getenv("GITHUB_TOKEN")
    repo = os.getenv("GITHUB_REPOSITORY")
    base_branch = os.getenv("GITHUB_BASE")
    gh_milestones, gh_milestones_object = all_gh_milestones(token=token, repo=repo)
    final_milestone = parse_branch(base_branch, gh_milestones)

    if final_milestone:
        print(f"Found milestone {final_milestone} for base branch {base_branch}")
    
    milestone_id = None
    for milestone in gh_milestones_object:
        if milestone['title'] == str(final_milestone):
            milestone_id = milestone['number']
            break

    if not milestone_id:
        exit(0)

    print(f"Retuning milestone {final_milestone} wih ID {milestone_id}")

    with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
        print(f'milestone_number={milestone_id}', file=fh)
