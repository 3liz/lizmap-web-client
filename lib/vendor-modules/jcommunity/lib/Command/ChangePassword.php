<?php

namespace Jelix\JCommunity\Command;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ChangePassword extends \Jelix\Scripts\ModuleCommandAbstract
{
    protected function configure()
    {
        $this
            ->setName('jcommunity:password:change')
            ->setDescription(\jLocale::get('jcommunity~password.change.cmdline.help.description'))
            ->setHelp(\jLocale::get('jcommunity~password.change.cmdline.help.text'))
            ->addArgument(
                'login',
                InputArgument::REQUIRED,
                \jLocale::get('jcommunity~password.change.cmdline.help.parameter.login')
            )
            ->addArgument(
                'password',
                InputArgument::OPTIONAL,
                \jLocale::get('jcommunity~password.change.cmdline.help.parameter.password')
            )
            ->addOption(
                'force',
                null,
                InputOption::VALUE_NONE,
                \jLocale::get('jcommunity~password.change.cmdline.help.option.force')
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
        $password = $input->getArgument('password');
        $force = $input->getOption('force');

        $code = 0;
        $message = '';

        $user = \jAuth::getUser($login);

        if (!$user) {
            $message = \jLocale::get('jcommunity~password.change.cmdline.error.unknown').PHP_EOL;
            $code = 1;
        }

        if (!$code && preg_match('/!!.*!!/', $user->password)) {
            $message = \jLocale::get('jcommunity~password.change.cmdline.error.module').PHP_EOL;
            $code = 1;
        }

        if (!$code && !$force && !empty($user->password)) {  
            $message = \jLocale::get('jcommunity~password.change.cmdline.error.defined').PHP_EOL;
            $code = 1;
        }

        if (!$password) {
            $password = \jAuth::getRandomPassword();
        }

        if (!$code) {
            if (\jAuth::changePassword($login, $password)) {
                $output->writeLn($login . ': ' . $password . PHP_EOL);
                $message = \jLocale::get(
                        'jcommunity~password.change.cmdline.success'
                    ) . PHP_EOL;
                $code = 0;
            } else {
                $message = \jLocale::get(
                        'jcommunity~password.change.cmdline.error.change'
                    ) . PHP_EOL;
                $code = 1;
            }
        }

        return $this->displayMessage($output, $code, $message);
    }
}