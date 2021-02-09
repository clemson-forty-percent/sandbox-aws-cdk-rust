import { expect as expectCDK, haveResource, arrayWith, objectLike } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as SandboxAwsCdkRust from '../lib/sandbox-aws-cdk-rust-stack';

/* test('Empty Stack', () => { */
/*     const app = new cdk.App(); */
/*     // WHEN */
/*     const stack = new SandboxAwsCdkRust.SandboxAwsCdkRustStack(app, 'MyTestStack'); */
/*     // THEN */
/*     expectCDK(stack).to(matchTemplate({ */
/*       "Resources": {} */
/*     }, MatchStyle.EXACT)) */
/* }); */

test('Contains Lambda with runtime', () => {
    const app = new cdk.App();

    // WHEN
    const stack = new SandboxAwsCdkRust.SandboxAwsCdkRustStack(app, 'TestStack');

    // THEN
    expectCDK(stack).to(haveResource('AWS::Lambda::Function', {
        Runtime: 'provided.al2',
    }));
});

test('APIGatewayV2 with GET /hello', () => {
    const app = new cdk.App();

    // WHEN
    const stack = new SandboxAwsCdkRust.SandboxAwsCdkRustStack(app, 'TestStack');

    // THEN
    expectCDK(stack).to(haveResource('AWS::ApiGatewayV2::Route', {
        RouteKey: 'GET /hello',
    }));
})
