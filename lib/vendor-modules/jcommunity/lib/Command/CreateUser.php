<?php
/**
 * @author      Laurent Jouanneau
 * @contributor Adrien Lagroy de Croutte
 * @copyright   2020 Laurent Jouanneau, 2020 Adrien Lagroy de Croutte
 *
 * @see         https://jelix.org
 * @licence     http://www.gnu.org/licenses/gpl.html GNU General Public Licence, see LICENCE file
 */

namespace Jelix\JCommunity\Command;

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CreateUser extends \Jelix\Scripts\ModuleCommandAbstract
{
    protected function configure()
    {
        $this
            ->setName('jcommunity:user:create')
            ->setDescription(\jLocale::get('jcommunity~register.cmdline.create.help.description'))
            ->setHelp(\jLocale::get('jcommunity~register.cmdline.create.help.text'))
            ->addArgument(
                'login',
                InputArgument::REQUIRED,
                \jLocale::get('jcommunity~register.cmdline.create.help.parameter.login')
            )
            ->addArgument(
                'email',
                InputArgument::REQUIRED,
                \jLocale::get('jcommunity~register.cmdline.create.help.parameter.email')
            )
            ->addArgument(
                'password',
                InputArgument::OPTIONAL,
                \jLocale::get('jcommunity~register.cmdline.create.help.parameter.password')
            )
            ->addOption(
                'admin',
                null,
                InputOption::VALUE_NONE,
                \jLocale::get('jcommunity~register.cmdline.create.help.option.admin')
            )
            ->addOption(
                'reset',
                null,
                InputOption::VALUE_NONE,
                \jLocale::get('jcommunity~register.cmdline.create.help.option.reset')
            )
            ->addOption(
                'no-error-if-exist',
                null,
                InputOption::VALUE_NONE,
                \jLocale::get('jcommunity~register.cmdline.create.help.option.noerror')
            )
        ;
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
        $email = $input->getArgument('email');
        $password = $input->getArgument('password');
        $reset = $input->getOption('reset');
        $admin = $input->getOption('admin');

        $code = 0;
        $message = '';

        $user = \jAuth::getUser($login);

        if ($user) {
            $message = \jLocale::get('jcommunity~register.form.login.exists');
            $code = 1;
        }

        if (!$code && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $message = \jLocale::get('jcommunity~register.email.bad.format');
            $code = 1;
        }

        if ($code) {
            return $this->displayMessage($output, $code, $message);
        }

        if (!$password) {
            if ($reset) {
                $password = '';
            } else {
                $password = \jAuth::getRandomPassword();
                $output->writeln($login.': '.$password);
            }
        }

        $user = \jAuth::createUserObject($login, $password);
        $user->email = $email;
        $user->status = \Jelix\JCommunity\Account::STATUS_VALID;
        \jAuth::saveNewUser($user);
        if ($admin) {
            \jAcl2DbUserGroup::addUserToGroup($login, 'admins');
        }
        $message = \jLocale::get('jcommunity~register.registration.cmdline.ok');

        if ($reset) {
            $passReset = new \Jelix\JCommunity\PasswordReset(true, true);
            $result = $passReset->sendEmail($login, $user->email);
            if ($result != \Jelix\JCommunity\PasswordReset::RESET_OK) {
                $message = $message.\jLocale::get('jcommunity~password.reset.cmdline.error');
                $code = 1;
            }
        }
        return $this->displayMessage($output, $message, $code);
    }
}
