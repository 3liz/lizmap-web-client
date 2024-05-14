#!/usr/bin/python3

import os
import requests

from typing import Optional, Tuple

LOGIN = "3liz-bot"
# LOGIN = "Gustry"


def current_metadata(token: str, repo: str, ref: str) -> Tuple[bool, str, str]:
    """ Get current PR metadata. """
    r = requests.get(
        f"https://api.github.com/repos/{repo}/pulls/{ref}",
        headers={
            'Authorization': f'Bearer {token}'
        }
    )
    metadata = r.json()
    is_backport = metadata.get('title').startswith('[Backport') and metadata.get('user').get('login') == LOGIN
    if not is_backport:
        return False, "", ""
    body = metadata.get('body')
    parent_number = body.split('\n')[0]
    parent_number = parent_number.split('#')[1]
    return is_backport, parent_number, body


def parent_metadata(token: str, repo: str, ref: str):
    """ Get current PR metadata. """
    r = requests.get(
        f"https://api.github.com/repos/{repo}/pulls/{ref}",
        headers={
            'Authorization': f'Bearer {token}'
        }
    )
    metadata = r.json()
    labels_info = metadata.get('labels')
    is_sponsored = False
    sponsor = ""
    labels = []
    for label in labels_info:
        if label.get('id') == '1933297134':
            is_sponsored = True
        labels.append(label.get("name"))

    body = metadata.get('body')
    body = body.split('Funded by')
    if len(body) >= 2:
        body = body[1].split('\n')
        sponsor = body[0]
    return is_sponsored, sponsor.strip(), labels


if __name__ == "__main__":
    try:
        token = os.getenv("GITHUB_TOKEN")
        repo = os.getenv("GITHUB_REPOSITORY")
        github_ref = os.getenv("GITHUB_PR_REF")
        is_backport, parent_ref, description = current_metadata(token=token, repo=repo, ref=github_ref)
        if not is_backport:
            raise Exception

        # print("Current PR :")
        # print(f"IS backport : {is_backport}")
        # print(f"Parent ID : {parent_ref}")
        # print(f"Desc : {description}")
        is_sponsored, sponsor, labels = parent_metadata(token=token, repo=repo, ref=parent_ref)
        labels_str = ','.join([f'"{l}"' for l in labels])
        labels_str = f"[{labels_str}]"
        # print("Parent PR :")
        # print(f"Is sponso : {is_sponsored}")
        # print(f"Sponso : {sponsor}")
        # print(f"Labels : {labels_str}")
        if os.environ['GITHUB_OUTPUT']:
            with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
                print(f'labels={labels_str}', file=fh)
            if is_sponsored and sponsor:
                with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
                    print(f'sponsor={sponsor}', file=fh)

                # with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
                #     print(f'description={description}', file=fh)

    except Exception:
        with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
            print(f'labels=', file=fh)
        with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
            print(f'sponsor=', file=fh)
        with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
            print(f'description=', file=fh)
