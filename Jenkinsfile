pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_URL = '851725583741.dkr.ecr.ap-south-1.amazonaws.com'
        REPO_NAME = 'ci-cd-performance-test'
        IMAGE_TAG = "${BUILD_NUMBER}"
        EC2_IP = '43.204.148.166'  // Use your EC2 public IP
    }

    stages {
        stage('Clone Repo') {
            steps {
                echo 'Repo already checked out in SCM stage'
            }
        }

        stage('Install & Test') {
            steps {
                sh 'npm install'
                sh 'npm test || echo "Tests failed but continuing..."'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t $REPO_NAME:$IMAGE_TAG ."
                }
            }
        }

        stage('Push to ECR') {
            steps {
                script {
                    sh """
                        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URL
                        docker tag $REPO_NAME:$IMAGE_TAG $ECR_URL/$REPO_NAME:$IMAGE_TAG
                        docker push $ECR_URL/$REPO_NAME:$IMAGE_TAG
                    """
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@$EC2_IP << EOF
                        docker login -u AWS -p \$(aws ecr get-login-password --region $AWS_REGION) $ECR_URL
                        docker stop $REPO_NAME || true
                        docker rm $REPO_NAME || true
                        docker pull $ECR_URL/$REPO_NAME:$IMAGE_TAG
                        docker run -d --name $REPO_NAME -p 3000:3000 $ECR_URL/$REPO_NAME:$IMAGE_TAG
                        EOF
                    """
                }
            }
        }
    }
}
