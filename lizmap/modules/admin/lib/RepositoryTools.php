<?php

namespace LizmapAdmin;

class RepositoryTools
{
    /**
     * Fix domain list.
     *
     * @param array<string> $domainList The domain list to fix
     *
     * @return array<string> The domain list fixed
     *
     * @throws \ValueError If a domain is not valid
     */
    public static function fixDomainList(array $domainList): array
    {
        $newDomainList = array();
        foreach ($domainList as $domain) {
            $domain = trim($domain);
            if ($domain == '') {
                continue;
            }
            if (!preg_match('!^(https?://)!', $domain)) {
                $domain = 'https://'.$domain;
            }
            $urlParts = parse_url($domain);
            if ($urlParts === false || !filter_var($domain, FILTER_VALIDATE_URL)) {
                throw new \ValueError('`'.$domain.'` is not a valid!');
            }

            // we clean the url
            $newDomain = $urlParts['scheme'].'://'.$urlParts['host'];
            if (isset($urlParts['port']) && $urlParts['port']) {
                $newDomain .= ':'.$urlParts['port'];
            }
            $newDomainList[] = $newDomain;
        }

        return $newDomainList;
    }
}
