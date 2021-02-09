import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigatewayv2';
import * as apigwi from '@aws-cdk/aws-apigatewayv2-integrations';

export class SandboxAwsCdkRustStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define lambda functions
    const rustTest = new lambda.Function(this, 'rustTest', {
        runtime: lambda.Runtime.PROVIDED_AL2,
        code: lambda.Code.fromAsset('lambda/hello/target/lambda/release/hello.zip'),
        handler: 'doesnt.matter',
    });

    const rustTestIntegration = new apigwi.LambdaProxyIntegration({
        handler: rustTest,
    });

    // Define API and routes
    const httpApi = new apigw.HttpApi(this, 'HttpApi');

    httpApi.addRoutes({
        path: '/hello',
        methods: [ apigw.HttpMethod.GET ],
        integration: rustTestIntegration,
    });
  }
}
