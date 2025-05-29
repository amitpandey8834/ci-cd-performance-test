pipeline {
    agent any

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
                sh '''
                    docker run --rm -v "$PWD":/app -w /app node:18 npm install
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    docker run --rm -v "$PWD":/app -w /app node:18 npm test || true
                '''
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
                    docker run -d --name nodeapp -p 3000:3000 $IMAGE_NAME
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
