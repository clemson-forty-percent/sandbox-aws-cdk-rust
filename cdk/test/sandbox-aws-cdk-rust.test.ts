import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as SandboxAwsCdkRust from '../lib/sandbox-aws-cdk-rust-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new SandboxAwsCdkRust.SandboxAwsCdkRustStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
