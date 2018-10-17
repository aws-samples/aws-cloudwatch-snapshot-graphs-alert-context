// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk'),
      nodemailer = require('nodemailer');

const email_to = process.env.EMAIL_TO_ADDRESS;
const email_from = process.env.EMAIL_FROM_ADDRESS;
const mail_server_region = process.env.MAIL_SERVER_REGION;
const region = process.env.AWS_REGION;

let widgetDefinition = { MetricWidget: 
    {
        width: 600,
        height: 400,
        start: "-PT3H", // past 3 hrs of data
        end: "PT0H",
        view: "timeSeries",
        stacked: false,
        metrics: [],
        stat: "Average",
        yAxis: {
            left: {
                min: 0,
                max: 0
            }
        },
        period: 60,
        title: "Snapshot Graphs Demo",
        annotations: {
            horizontal: [
            {
                color: "#ff6961",
                label: "Trouble threshold start",
                value: 0
            }]
        }
    }
};

exports.myHandler = function(event, context, callback) {

    const message = JSON.parse(event.Records[0].Sns.Message),
          trigger = message.Trigger, 
          to = email_to,
          body = message.NewStateReason,
          subject = `Alert: ${trigger.Namespace} Metric: ${trigger.MetricName} Threshold: ${trigger.Threshold}` ; ;
  
    var cloudwatch = new AWS.CloudWatch();

    cloudwatch.getMetricWidgetImage(getWidgetDefinition(trigger, message), function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            var image = new Buffer(data.MetricWidgetImage).toString('base64')

            var response = {
                statusCode: (err ? 500 : 200),
                headers: {
                'Content-Type' : 'image/png'
                },
                body: image
            };
            sendImagesToEmail(email_from,
                              to, 
                              subject, 
                              image, 
                              `<div>${body}</div>`,
                              body)
            .then(callback(err, response));
        }
    });
  
}

function getWidgetDefinition(trigger, message) {
    var metrics = [] ;
    var metric = [ trigger.Namespace, trigger.MetricName, trigger.Dimensions[0].name, trigger.Dimensions[0].value ];
  
    metrics.push(metric);
    widgetDefinition.MetricWidget.metrics = metrics;
    widgetDefinition.MetricWidget.yAxis.left.max = getYMax(message.NewStateReason) ; 
    widgetDefinition.MetricWidget.title = trigger.MetricName ; 
    widgetDefinition.MetricWidget.annotations.horizontal[0].value = trigger.Threshold;

    var mw = JSON.stringify(widgetDefinition.MetricWidget);
    widgetDefinition.MetricWidget = mw ;

    return widgetDefinition ;
}

function getYMax(s) {

     var regex1 = /\[[0-9]*.[0-9]/;
     var datapoint = regex1.exec(s)[0].substring(1); 

     return datapoint * 3 ; // arbitrary scaling factor
}

function sendImagesToEmail(from, to, subject, images, html,text) {

    return new Promise(function(resolve, reject) {

    let ses = new AWS.SES({ region: mail_server_region }),
        transporter = nodemailer.createTransport({ SES: ses }),
        imagesHtml = `<img src="cid:imageId">`,
        emailParams = {
            from: from,
            to: to,
            subject: subject,
            text: text,
            html: `<html>
                    <body>
                        <table>
                            <tr><td style="vertical-align: text-top;">${imagesHtml}</td></tr>
                            <tr><td style="vertical-align: text-top;">${html || ''}</td></tr>
                        </table>
                    </body>
                </html>`,
            attachments: []
        };
 
        emailParams.attachments.push({
                cid: `imageId`,
                filename: `megatronImage.png`,
                path: `data::image/png;base64,${images}`
        });
 
        console.log(emailParams);
 
        transporter.sendMail(emailParams, (err, info) => {

            if(err) console.log(err);

            console.log(`Email sent to ${to}`);
            resolve();
        });
    });
}



