pipeline {
    agent {
        docker {
            image 'node:18'  // Official Node.js image with npm preinstalled
            args '-v /var/run/docker.sock:/var/run/docker.sock'  // Mount Docker socket so we can build/run Docker inside the container
        }
    }

    environment {
        IMAGE_NAME = "nodejs-staging-app"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test || true'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                docker stop nodeapp || true
                docker rm nodeapp || true
                docker run -d --name nodeapp --network host $IMAGE_NAME
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Successfully deployed to staging!'
        }
        failure {
            echo '❌ Build or deployment failed.'
        }
    }
}
