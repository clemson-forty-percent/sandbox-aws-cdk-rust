#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SandboxAwsCdkRustStack } from '../lib/sandbox-aws-cdk-rust-stack';

const app = new cdk.App();
new SandboxAwsCdkRustStack(app, 'SandboxAwsCdkRustStack');
