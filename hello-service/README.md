[![aws provider](https://img.shields.io/badge/provider-AWS-orange?logo=amazon-aws&color=ff9900)](https://aws.amazon.com)

# Sandbox-aws-cdk-rust

This is a quick replication of some backend test code for an AWS project so that I can try to create and test CI/CD pipelines for it with CodeBuild and CodeDeploy/CodePipelines.

The only steps that intentionally have to be done manually are:

1. Creating an AWS account
2. Adding an IAM User with an API key-pair in AWS
3. Adding a `GitHub-PAT` secret of `PERSONAL_ACCESS_TOKEN` to your AWS Secrets Manager.

I'm using `direnv` + `nix` so nodejs and rust dependencies automatically are installed via `shell.nix`.

## Files of note

The following files may be interesting to beginners with AWS or developers looking to build AWS lambdas with Rust.

- `shell.nix` - Required binaries to run and build the project.
- `lib/cdk-ci-pipeline-stack.ts` - The cdk structure for building a simple CI pipeline for Cargo.
- `lib/sandbox-aws-cdk-rust-stack.ts` - The cdk structure for building the Lambda application.
- `lambda/buildspec_debug.yml` - The codebuild buildspec file for installing rustup and using it in AL2.
- `lambda/hello/src/main.rs` - An example of a simple AWS APIGatewayV2 handler. Good for if you're thinking of building a REST api in Rust.

## FAQ

Why is this all in one repo?

- Kinda stuck doing it all in one repo for the AWS project I mentioned, so best to replicate my constraints. This is almost certainly not best practice, but it's what I've got.

Why Rust/TypeScript?

- I'm a fan of strong typing and memory safety.

Why not use Serverless?

- Trying to stick to using CDK for most things, and helps centralize configuration.

Have you heard of Nix?

- Sure have! [Check it out if you haven't!](https://nixos.org/)

## Further resources

- [AWS-CDK API docs](https://docs.aws.amazon.com/cdk/api/latest/)
- [AWS-CDK repo](https://github.com/aws/aws-cdk)
- [AWS Lambda Rust Runtime](https://github.com/awslabs/aws-lambda-rust-runtime)
- [AWS Rust Lambda Events Structs](https://github.com/LegNeato/aws-lambda-events)
