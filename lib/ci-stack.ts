import * as cdk from '@aws-cdk/core';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as s3 from '@aws-cdk/aws-s3';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';

export class CiStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const cacheBucket = new s3.Bucket(this, 'CiCacheBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.KMS,
            bucketKeyEnabled: true,
        });

        /* const artifactBucket = new s3.Bucket(this, 'CiArtifactBucket'); */

        /* const mainNpmBuild = new codebuild.Project() */
        new codebuild.GitHubSourceCredentials(this, 'CodeBuildGitHubCreds', {
            accessToken: cdk.SecretValue.secretsManager('GitHub-PAT', {
                jsonField: 'PERSONAL_ACCESS_TOKEN',
            }),
        });

        const mainCargoBuild = new codebuild.Project(this, 'CiMainCargoBuild', {
            /* buildSpec: codebuild.BuildSpec.fromSourceFilename('lambda/buildspec_release.yml'), */
            buildSpec: codebuild.BuildSpec.fromSourceFilename('lambda/buildspec_debug.yml'),
            source: codebuild.Source.gitHub({
                owner: 'houstdav000',
                repo: 'sandbox-aws-cdk-rust',
                branchOrRef: 'main',
                fetchSubmodules: false,
                webhook: true,
                webhookFilters: [
                    codebuild.FilterGroup
                        .inEventOf(codebuild.EventAction.PULL_REQUEST_CREATED)
                        .andBranchIs('feature-backend/*')
                        .andBaseBranchIs('main'),
                    codebuild.FilterGroup
                        .inEventOf(codebuild.EventAction.PULL_REQUEST_UPDATED)
                        .andBranchIs('feature-backend/*')
                        .andBaseBranchIs('main'),
                ],
            }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
                computeType: codebuild.ComputeType.SMALL,
            },
            /* artifacts: codebuild.Artifacts.s3({ */
            /*     bucket: artifactBucket, */
            /*     includeBuildId: false, */
            /*     name: 'projects', */
            /* }), */
            /* secondaryArtifacts: [ */
            /*     codebuild.Artifacts.s3({ */
            /*         bucket: artifactBucket, */
            /*         includeBuildId: false, */
            /*         name: 'hello.zip', */
            /*         identifier: 'lambda_hello', */
            /*     }), */
            /*     codebuild.Artifacts.s3({ */
            /*         bucket: artifactBucket, */
            /*         includeBuildId: false, */
            /*         name: 'another.zip', */
            /*         identifier: 'lambda_another', */
            /*     }), */
            /* ], */
            cache: codebuild.Cache.bucket(cacheBucket),
            timeout: cdk.Duration.minutes(5),
        });
    }
}
