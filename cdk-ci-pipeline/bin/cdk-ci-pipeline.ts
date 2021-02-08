#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkCiPipelineStack } from '../lib/cdk-ci-pipeline-stack';

const app = new cdk.App();
new CdkCiPipelineStack(app, 'SandboxCdkAwsRustPipeline');
