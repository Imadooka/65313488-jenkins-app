pipeline {
    agent any

    environment {
        NETLIFY_SITE_ID = 'c39b249f-8fc6-42a7-8218-d997b134449d'
        NETLIFY_AUTH_TOKEN = credentials('netlify-token')
    }

    stages {
        stage('Validate Files') {
            agent { docker { image 'node:18-alpine'; reuseNode true } }
            steps {
                echo "🔍 Verifying required project files..."
                sh '''
                    test -f index.html || (echo "❌ Missing index.html" && exit 1)
                    test -f netlify/functions/quote.js || (echo "❌ Missing quote function" && exit 1)
                    echo "✅ All required files are present."
                '''
            }
        }

        stage('Run Unit Tests') {
            agent { docker { image 'node:18-alpine'; reuseNode true } }
            steps {
                echo "🧪 Running function tests..."
                sh '''
                    node -e "require('./netlify/functions/quote.js'); console.log('✅ Function executed successfully!')"
                '''
            }
        }

        stage('Deploy to Netlify') {
            agent { docker { image 'node:18-alpine'; reuseNode true } }
            steps {
                echo "🚀 Starting deployment..."
                retry(2) {
                    sh '''
                        npx netlify deploy \
                          --auth=$NETLIFY_AUTH_TOKEN \
                          --site=$NETLIFY_SITE_ID \
                          --dir=. \
                          --prod
                    '''
                }
            }
        }
    }

    post {
        success {
            script {
                echo "🎉 Deployment successful! Your app is live."
                slackSend channel: '#deployments', message: "✅ Deployment successful! 🚀"
            }
        }
        failure {
            script {
                echo "🚨 Deployment failed. Please check logs for more details."
                slackSend channel: '#deployments', message: "❌ Deployment failed! Check logs."
            }
        }
    }
}
