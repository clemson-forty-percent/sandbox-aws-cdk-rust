import { expect as expectCDK, haveResource, arrayWith, objectLike } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as Ci from '../lib/ci-stack';


test('ArtifactBucketCreated', () => {
    const app = new cdk.App();

    // WHEN
    const stack = new Ci.CiStack(app, 'TestStack');

    // THEN
    expectCDK(stack).to(haveResource('AWS::S3::Bucket'));

});

test('ArtifactBucketEncrypted', () => {
    const app = new cdk.App();

    // WHEN
    const stack = new Ci.CiStack(app, 'TestStack');

    // THEN
    expectCDK(stack).to(haveResource('AWS::S3::Bucket', {
        BucketEncryption: objectLike({
            ServerSideEncryptionConfiguration: arrayWith(objectLike({
                BucketKeyEnabled: true
            })),
        }),
    }));
});
