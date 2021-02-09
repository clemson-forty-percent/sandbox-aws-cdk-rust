#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SandboxAwsCdkRustStack } from '../lib/sandbox-aws-cdk-rust-stack';
import { CdkCiPipelineStack } from '../lib/cdk-ci-pipeline-stack';

const mainApp = new cdk.App();
new SandboxAwsCdkRustStack(mainApp, 'SandboxAwsCdkRustStack');

const ciApp = new cdk.App();
new CdkCiPipelineStack(ciApp, 'CdkCiPipelineStack');
