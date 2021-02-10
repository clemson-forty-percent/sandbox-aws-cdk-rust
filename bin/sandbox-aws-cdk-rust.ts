#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigatewayv2';
import * as apigwi from '@aws-cdk/aws-apigatewayv2-integrations';
import * as s3 from '@aws-cdk/aws-s3';
import { LambdaStack } from '../lib/lambda-stack';
import { PipelineStack } from '../lib/pipeline-stack';
import { CiStack } from '../lib/ci-stack';

// Create CI stack
const ciApp = new cdk.App();
new CiStack(ciApp, 'CiStack');

// Create main stacks
const mainApp = new cdk.App();
const lambdaStack = new LambdaStack(mainApp, 'LambdaStack');
const pipelineStack = new PipelineStack(mainApp, 'PipelineStack');

//****************************************************************************//
//                                                                            //
//                Setup test stack and deployment pipeline                    //
//                                                                            //
//****************************************************************************//

// Define lambda code
const helloCode = lambda.Code.fromCfnParameters();
const anotherCode = lambda.Code.fromCfnParameters();

// Create lambdas
const helloLambda = new lambda.Function(lambdaStack, 'HelloLambda', {
    code: helloCode,
    runtime: lambda.Runtime.PROVIDED_AL2,
    handler: 'doesnt.matter',
});

const anotherLambda = new lambda.Function(lambdaStack, 'AnotherLambda', {
    code: anotherCode,
    runtime: lambda.Runtime.PROVIDED_AL2,
    handler: 'doesnnt.matter',
});

// Define API and routes
const httpApi = new apigw.HttpApi(lambdaStack, 'HttpApi');

httpApi.addRoutes({
    path: '/hello',
    methods: [ apigw.HttpMethod.GET ],
    integration: new apigwi.LambdaProxyIntegration({
        handler: helloLambda,
    }),
});

httpApi.addRoutes({
    path: '/another',
    methods: [ apigw.HttpMethod.GET ],
    integration: new apigwi.LambdaProxyIntegration({
        handler: anotherLambda,
    }),
});

// Create Pipeline system
const artifactBucket = new s3.Bucket(pipelineStack, 'ArtifactBucket', {
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    encryption: s3.BucketEncryption.KMS,
    bucketKeyEnabled: true,
});


const lambdaPipeline = new codepipeline.Pipeline(pipelineStack, 'Pipeline', {
    artifactBucket: artifactBucket,
    crossAccountKeys: false,
    restartExecutionOnUpdate: true,
});

// Add source stage
const sourceOutput = new codepipeline.Artifact();
const sourceAction = new codepipeline_actions.GitHubSourceAction({
    actionName: 'GitHub_Source',
    oauthToken: cdk.SecretValue.secretsManager('GitHub-PAT', {
        jsonField: 'PERSONAL_ACCESS_TOKEN',
    }),
    output: sourceOutput,
    owner: 'houstdav000',
    repo: 'sandbox-aws-cdk-rust',
    branch: 'main',
    trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
});

lambdaPipeline.addStage({
    stageName: 'Source',
    actions: [
        sourceAction,
    ],
});

// Add build stage
const cacheBucket = new s3.Bucket(pipelineStack, 'CacheBucket', {
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    encryption: s3.BucketEncryption.KMS,
    bucketKeyEnabled: true,
});

const cdkBuildProject = new codebuild.Project(pipelineStack, 'CdkBuildProject', {
    buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
            install: {
                commands: [
                    'npm install',
                ],
            },
            build: {
                commands: [
                    'npm run build',
                    'npm run cdk synth LambdaStack',
                ],
            },
        },
        artifacts: {
            "discard-paths": 'yes',
            files: [
                'cdk.out/LambdaStack.template.json',
            ],
        },
    }),
    environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
        computeType: codebuild.ComputeType.SMALL,
    },
    cache: codebuild.Cache.bucket(cacheBucket),
    timeout: cdk.Duration.minutes(5),
});

const cdkBuildOutput = new codepipeline.Artifact();
const cdkBuildAction = new codepipeline_actions.CodeBuildAction({
    actionName: 'CDK_Build',
    project: cdkBuildProject,
    input: sourceOutput,
    outputs: [
        cdkBuildOutput,
    ],
});

const lambdaHelloOutput = codebuild.Artifacts.s3({
    bucket: artifactBucket,
    includeBuildId: false,
    name: 'hello.zip',
    identifier: 'Artifact_Build_Lambda_Build_1',
});

const lambdaAnotherOutput = codebuild.Artifacts.s3({
    bucket: artifactBucket,
    includeBuildId: false,
    name: 'another.zip',
    identifier: 'Artifact_Build_Lambda_Build_2',
});

const lambdaBuildProject = new codebuild.Project(pipelineStack, 'LambdaBuildProject', {
    environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
        computeType: codebuild.ComputeType.SMALL,
    },
    secondaryArtifacts: [
        lambdaHelloOutput,
        lambdaAnotherOutput,
    ],
    cache: codebuild.Cache.bucket(cacheBucket),
    timeout: cdk.Duration.minutes(5),
    buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        "run-as": 'root',
        env: {
            shell: 'bash',
        },
        phases: {
            install: {
                commands: [
                    'curl --proto =https --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable-x86_64-unknown-linux-gnu',
                    'source /root/.cargo/env',
                ],
            },
            pre_build: {
                commands: [
                    'cd lambda',
                    'rustup override set stable-x86_64-unknown-linux-gnu',
                ],
            },
            build: {
                commands: [
                    'cargo build --workspace --release',
                ],
            },
            post_build: {
                commands: [
                    'cp target/release/hello hello/bootstrap',
                    'strip hello/bootstrap',
                    'cp target/release/another another/bootstrap',
                    'strip another/bootstrap',
                ],
            },
        },
        artifacts: {
            "discard-paths": 'yes',
            "s3-prefix": 'lambda-artifacts',
            "secondary-artifacts": {
                Artifact_Build_Lambda_Build_1: {
                    files: [
                        'lambda/hello/bootstrap',
                    ],
                    name: 'Artifact_Build_Lambda_Build_1',
                },
                Artifact_Build_Lambda_Build_2: {
                    files: [
                        'lambda/another/bootstrap',
                    ],
                    name: 'Artifact_Build_Lambda_Build_2',
                },
            },
        },
        cache: {
            paths: [
                '/root/.cargo/registry/**/*',
                '/root/.cargo/git/**/*',
                'lambda/target/release/**/*',
            ],
        },
    }),
});

const lambdaBuildHelloOutput = new codepipeline.Artifact();
const lambdaBuildAnotherOutput = new codepipeline.Artifact();
const lambdaBuildAction = new codepipeline_actions.CodeBuildAction({
    actionName: 'Lambda_Build',
    project: lambdaBuildProject,
    input: sourceOutput,
    outputs: [
        lambdaBuildHelloOutput,
        lambdaBuildAnotherOutput,
    ],
});

lambdaPipeline.addStage({
    stageName: 'Build',
    actions: [
        cdkBuildAction,
        lambdaBuildAction,
    ],
});

// Deploy stage
const deployAction = new codepipeline_actions.CloudFormationCreateUpdateStackAction({
    actionName: 'Lambda_CFN_Deploy',
    templatePath: cdkBuildOutput.atPath('LambdaStack.template.json'),
    stackName: 'LambdaStackDeployed',
    adminPermissions: true,
    parameterOverrides: {
        ...helloCode.assign(lambdaBuildHelloOutput.s3Location),
        ...anotherCode.assign(lambdaBuildAnotherOutput.s3Location),
    },
    extraInputs: [
        lambdaBuildHelloOutput,
        lambdaBuildAnotherOutput,
    ],
});

lambdaPipeline.addStage({
    stageName: 'Deploy',
    actions: [
        deployAction,
    ],
});
