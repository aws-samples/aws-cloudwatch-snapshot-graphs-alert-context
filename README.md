## AWS Cloudwatch Snapshot Graphs Alert Context

Code samples related to "Reduce Time to Resolution with Amazon CloudWatch Snapshot Graphs and Alerts” blog post published on the AWS DevOps blog. This sample demonstrates how to integrate CloudWatch snapshot graphs with email alerts to add more context to the alert.

## License Summary

This sample code is made available under a modified MIT license. See the LICENSE file.

## Setup Instructions

This project includes code that is intended to run as an AWS Lambda function. Full instructions can be found in the associated blog post on the AWS DevOps blog. 

To setup the Lambda: 

1. Download the repository. 
2. Run 'npm install' to create dependencies. 
3. ZIP the entire project 'zip -r snapshotgraphsalarmdemo.zip ./*'
4. Create a new NodeJS Lambda function and upload the ZIP as the source code. 
5. Set handler to emailer.myHandler. 
6. Increase execution timeout to 30s.
7. This Lambda function requires an IAM role with permissions for Amazon SES, Amazon SNS (readonly) and Amazon CloudWatch (readonly). 
8. Set the following environment variables - EMAIL_TO_ADDRESS, EMAIL_FROM_ADDRESS. Note that these email addresses have to be verified in the Amazon Simple Email Service before emails will be sent. 

Building the solution:
1. Create an SNS topic. 
2. Create a CloudWatch alarm and set the SNS topic as the target.
3. Subscribe the Lambda to the SNS topic.

When the CloudWatch alarm is triggered the Lambda function will send an email to the address set in the Lambda environment variable EMAIL_TO_ADDRESS.  

See the CloudWatch API documentation for [GetMetricWidgetImage](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_GetMetricWidgetImage.html) for more information. 
