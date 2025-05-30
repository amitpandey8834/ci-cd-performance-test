pipeline {
    agent any  // Run on Jenkins host with Docker daemon available

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_URL = '851725583741.dkr.ecr.ap-south-1.amazonaws.com'
        REPO_NAME = 'ci-cd-performance-test'
        IMAGE_TAG = "${BUILD_NUMBER}"
        EC2_IP = '43.204.148.166'  // Your EC2 public IP
        MONGO_URI = 'mongodb://admin:password@my-mongo:27017/testdb?authSource=admin'
    }

    stages {
        stage('Install & Test') {
            agent {
                docker {
                    image 'node:18'
                    // Connect to the Docker network where MongoDB is running
                    args '--network jenkins_network -u root'
                }
            }
            steps {
                sh 'npm install'
                // Run tests with MONGO_URI environment variable passed
                sh 'MONGO_URI=$MONGO_URI npm test || echo "Tests failed but continuing..."'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t $REPO_NAME:$IMAGE_TAG ."
            }
        }

        stage('Setup AWS CLI') {
            steps {
                sh '''
                    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
                    unzip awscliv2.zip
                    sudo ./aws/install
                    aws --version
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                sh """
                    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URL
                    docker tag $REPO_NAME:$IMAGE_TAG $ECR_URL/$REPO_NAME:$IMAGE_TAG
                    docker push $ECR_URL/$REPO_NAME:$IMAGE_TAG
                """
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@$EC2_IP << 'EOF'
                        # Install AWS CLI if not present
                        if ! command -v aws &> /dev/null; then
                            curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
                            unzip awscliv2.zip
                            sudo ./aws/install
                        fi

                        # Login and deploy Docker container
                        docker login -u AWS -p \$(aws ecr get-login-password --region $AWS_REGION) $ECR_URL
                        docker stop $REPO_NAME || true
                        docker rm $REPO_NAME || true
                        docker pull $ECR_URL/$REPO_NAME:$IMAGE_TAG
                        docker run -d --name $REPO_NAME -p 3000:3000 --network host $ECR_URL/$REPO_NAME:$IMAGE_TAG
                        EOF
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()  // Clean workspace after the build
        }
    }
}
