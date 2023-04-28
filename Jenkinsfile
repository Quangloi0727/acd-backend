pipeline {
    agent any
    environment {
        //docker config
        REGISTRY_URL = "192.168.15.112:5000/${env.GIT_BRANCH}"
        IMAGE_NAME = 'acd_backend'
        BUILD_VERSION = GIT_COMMIT.take(8)
      	APP_NAME = 'acd_backend'

        //notify config
        SKYPE_ACCOUNT = credentials('skype_account')
        SKYPE_ID = credentials('skype_autocall_groupid')

        GIT_COMMIT_MSG = sh (script: 'git log -1 --pretty=%B ${GIT_COMMIT}', returnStdout: true).trim()
        GIT_USERNAME = sh (script: 'git log -1 --pretty=%cn ${GIT_COMMIT}', returnStdout: true).trim()
    }
    stages {
        stage('SonarQube analysis') {
            steps {
                script {
                scannerHome = tool 'SonarQube Scanner 2.8'
                }
                withSonarQubeEnv('metech_sonar_server') {
                    sh "${scannerHome}/bin/sonar-scanner"
                }
            }
        }
        stage('Build') {
            steps {
                echo 'Building ...'
                script{
                    dockerImage = docker.build("${REGISTRY_URL}/${IMAGE_NAME}:${BUILD_VERSION}")
                    dockerImage.push()
                    dockerImage.push('latest')
                }
                echo 'Image is pushed!'
                sh 'docker image rm "${REGISTRY_URL}/${IMAGE_NAME}:${BUILD_VERSION}"'
                sh 'docker image rm "${REGISTRY_URL}/${IMAGE_NAME}:latest"'
                echo 'Local image is removed!'
            }
        }
      	stage('Update Helm Value') {
            steps {
                echo "triggering update helm value ...."
                build job: 'argocd', parameters: [string(name: 'app_name', value: env.APP_NAME),string(name: 'image_tag', value: env.BUILD_VERSION),string(name: 'branch', value: env.GIT_BRANCH)]
            }
        }
    }
    post {
       success {
            sh 'sendSkypeMessage -u "$SKYPE_ACCOUNT_USR" -p "$SKYPE_ACCOUNT_PSW" -cid "$SKYPE_ID" -bs "success" -jn "$JOB_NAME" -bn "$BUILD_NUMBER" -bu "$BUILD_URL" -gu "$GIT_USERNAME" -gcm "$GIT_COMMIT_MSG \n\n\nImage: $IMAGE_NAME - version: $BUILD_VERSION đã build xong!!! <3 <3 "'
        }
       failure {
            sh 'sendSkypeMessage -u "$SKYPE_ACCOUNT_USR" -p "$SKYPE_ACCOUNT_PSW" -cid "$SKYPE_ID" -bs "failed" -jn "$JOB_NAME" -bn "$BUILD_NUMBER" -bu "$BUILD_URL" -gu "$GIT_USERNAME" -gcm "$GIT_COMMIT_MSG \n\n\nImage: $IMAGE_NAME - version: $BUILD_VERSION đã build lỗi!!! (hotface)"'
        }
    }
}
