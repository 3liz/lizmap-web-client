<?php

namespace Jelix\JCommunity\Command;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ResetPassword extends \Jelix\Scripts\ModuleCommandAbstract
{
    protected function configure()
    {
        $this
            ->setName('jcommunity:password:reset')
            ->setDescription(\jLocale::get('jcommunity~password.reset.cmdline.help.description'))
            ->setHelp(\jLocale::get('jcommunity~password.reset.cmdline.help.description'))
            ->addArgument(
                'login',
                InputArgument::REQUIRED,
                \jLocale::get('jcommunity~password.reset.cmdline.help.parameter.login')
            );
    }

    protected function displayMessage(OutputInterface $output, $exitCode, $message = null)
    {
        if ($output->isVerbose() && $message) {
            $output->writeln($message);
        }
        return $exitCode;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $login = $input->getArgument('login');

        $code = 0;
        $message = '';

        $user = \jAuth::getUser($login);

        if (!$user) {
            $message = \jLocale::get('jcommunity~password.change.cmdline.error.unknown').PHP_EOL;
            $code = 1;
        }

        if (!$code && !$user->email) {
            $message = \jLocale::get('jcommunity~password.reset.cmdline.mail.undefined').PHP_EOL;
            $code = 1;
        }

        if (!$code && ($user->status == \Jelix\JCommunity\Account::STATUS_VALID
            || $user->status == \Jelix\JCommunity\Account::STATUS_PWD_CHANGED)) {
            $passReset = new \Jelix\JCommunity\PasswordReset(true, true);
            $result = $passReset->sendEmail($login, $user->email);
        }
        else {
            $result = \Jelix\JCommunity\PasswordReset::RESET_BAD_STATUS;
        }

        if (!$code && $result != \Jelix\JCommunity\PasswordReset::RESET_OK) {
            $message = \jLocale::get('jcommunity~password.reset.cmdline.error');
            $code = 1;
        }

        return $this->displayMessage($output, $code, $message);
    }

}