pipeline {
    agent any

    environment {
        NETLIFY_SITE_ID = 'c39b249f-8fc6-42a7-8218-d997b134449d'
        NETLIFY_AUTH_TOKEN = credentials('netlify-token')
        SLACK_WEBHOOK_URL = credentials('slack-webhook')
    }

    stages {
        stage('Validate Files') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                script {
                    def startTime = System.currentTimeMillis()
                    echo "🔍 Verifying required project files..."
                    sh '''
                        test -f index.html || (echo "❌ Missing index.html" && exit 1)
                        test -f netlify/functions/quote.js || (echo "❌ Missing quote function" && exit 1)
                        echo "✅ All required files are present."
                    '''
                    def duration = System.currentTimeMillis() - startTime
                    echo "✅ Validation completed in ${duration / 1000}s"
                }
            }
        }

        stage('Run Unit Tests') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                script {
                    def startTime = System.currentTimeMillis()
                    echo "🧪 Running function tests..."
                    sh '''
                        node -e "require('./netlify/functions/quote.js'); console.log('✅ Function executed successfully!')"
                    '''
                    def duration = System.currentTimeMillis() - startTime
                    echo "✅ Tests completed in ${duration / 1000}s"
                }
            }
        }

        stage('Show Latest Commit') {
            steps {
                script {
                    def commitMessage = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
                    def commitAuthor = sh(script: "git log -1 --pretty=%an", returnStdout: true).trim()
                    echo "📌 Latest Commit: ${commitMessage} by ${commitAuthor}"
                }
            }
        }

        stage('Deploy to Netlify') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                retry(2) {
                    script {
                        def startTime = System.currentTimeMillis()
                        echo "🚀 Starting deployment..."
                        sh '''
                            npx netlify deploy \
                              --auth=$NETLIFY_AUTH_TOKEN \
                              --site=$NETLIFY_SITE_ID \
                              --dir=. \
                              --prod
                        '''
                        def duration = System.currentTimeMillis() - startTime
                        echo "✅ Deployment completed in ${duration / 1000}s"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Deployment successful! Your app is live."
            sh '''
                curl -X POST -H 'Content-type: application/json' --data '{"text":"🎉 Deployment successful!"}' $SLACK_WEBHOOK_URL
            '''
        }
        failure {
            echo "🚨 Deployment failed. Please check logs for more details."
            sh '''
                curl -X POST -H 'Content-type: application/json' --data '{"text":"🚨 Deployment failed! Check Jenkins logs."}' $SLACK_WEBHOOK_URL
            '''
        }
    }
}
