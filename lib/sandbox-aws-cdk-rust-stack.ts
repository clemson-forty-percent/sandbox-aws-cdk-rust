import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigatewayv2';
import * as apigwi from '@aws-cdk/aws-apigatewayv2-integrations';

export class SandboxAwsCdkRustStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define lambda functions
    const helloTest = new lambda.Function(this, 'helloTest', {
        runtime: lambda.Runtime.PROVIDED_AL2,
        code: lambda.Code.fromAsset('lambda/target/release/hello.zip'),
        handler: 'doesnt.matter',
    });

    const helloTestIntegration = new apigwi.LambdaProxyIntegration({
        handler: helloTest,
    });

    // Define API and routes
    const httpApi = new apigw.HttpApi(this, 'HttpApi');

    httpApi.addRoutes({
        path: '/hello',
        methods: [ apigw.HttpMethod.GET ],
        integration: helloTestIntegration,
    });
  }
}
