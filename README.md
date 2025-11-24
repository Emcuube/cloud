# AWS Customer Feedback Analysis System

## Project Overview

This project implements a real-time customer feedback analysis system using AWS services. It helps businesses automatically collect, analyze, and visualize customer feedback data, enabling faster response times and data-driven decision making. The system is particularly valuable for organizations dealing with high volumes of customer feedback that require immediate insights.

## Business Value

- **Real-time Analysis**: Automatically process customer feedback as it arrives, eliminating manual analysis bottlenecks
- **Consistent Evaluation**: Apply standardized sentiment analysis across all feedback
- **Quick Issue Detection**: Identify and escalate critical customer concerns immediately
- **Data-Driven Insights**: Generate actionable business intelligence through automated dashboard visualizations
- **Scalable Solution**: Handle varying volumes of feedback with AWS's elastic infrastructure

## Architecture

```mermaid
flowchart TB
    subgraph Frontend["Frontend Hosting Layer"]
        OSS["Alibaba Cloud OSS
        Static Frontend Hosting"]
    end

    subgraph Client["Client Layer"]
        WebApp["Web Application
        or Mobile App"]
    end

    subgraph Auth["Authentication Layer"]
        Cognito["Amazon Cognito
        User Authentication"]
    end

    subgraph API["API Layer"]
        APIGW["API Gateway
        /feedback endpoint"]
    end

    subgraph Processing["Processing Layer"]
        Lambda["AWS Lambda
        Process Feedback Function"]

        subgraph Analysis["Analysis Services"]
            Comprehend["Amazon Comprehend
            Sentiment Analysis"]
        end
    end

    subgraph Storage["Storage Layer"]
        DDB["DynamoDB
        Feedback Table"]
    end

    subgraph Analytics["Analytics Layer"]
        subgraph Dashboards["Dashboard Views"]
            Overview["Overview Dashboard"]
            DetailedAnalysis["Detailed Analysis"]
        end
    end

    OSS -->|"Load Static UI Files"| WebApp
    WebApp -->|"Authenticate"| Cognito
    Cognito -->|"Authorized Request"| APIGW
    Client -->|"POST /feedback"| APIGW

    APIGW -->|Trigger| Lambda
    Lambda -->|"Analyze Text"| Comprehend
    Comprehend -->|"Return Sentiment"| Lambda
    Lambda -->|"Store Feedback"| DDB
    DDB -->|"Real-time\nData"| Elasticsearch
    Elasticsearch --> Overview
    Elasticsearch --> DetailedAnalysis

    classDef aws fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:black;
    classDef alibaba fill:#FF6A00,stroke:#333,stroke-width:2px,color:white;
    classDef dashboard fill:#00A1C9,stroke:#232F3E,stroke-width:2px,color:white;
    classDef client fill:#3B48CC,stroke:#232F3E,stroke-width:2px,color:white;

    class APIGW,Lambda,Comprehend,DDB,Elasticsearch,Cognito aws;
    class OSS alibaba;
    class Overview,DetailedAnalysis dashboard;
    class WebApp client;
```

## Run the Feedback Simulator


```bash
# Edit .env to set your API GW Endpoints
npm install
npm run dev
```

Access the simulator at http://localhost:5173/


## License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Copyright 2024 Schmitech Inc.
