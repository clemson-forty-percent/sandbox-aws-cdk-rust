use lambda::{handler_fn, Context};
use aws_lambda_events::event::apigw::{ApiGatewayV2httpRequest, ApiGatewayV2httpResponse};
use aws_lambda_events::encodings;
use http::header::HeaderMap;

type Error = Box<dyn std::error::Error + Sync + Send + 'static>;

#[tokio::main]
async fn main() -> Result<(), Error> {
    let func = handler_fn(echo);
    lambda::run(func).await?;
    Ok(())
}

async fn echo(event: ApiGatewayV2httpRequest, _: Context) -> Result<ApiGatewayV2httpResponse, Error> {
    let mut headers = HeaderMap::new();

    headers.insert(http::header::CONTENT_TYPE, "text/plain".parse().unwrap());

    let body = encodings::Body::from(format!("Hello from Rust! You've reached another endpoint, {}", event.raw_path.unwrap()));

    let response = ApiGatewayV2httpResponse {
        status_code: 200,
        headers: headers,
        multi_value_headers: HeaderMap::new(),
        body: Some(body),
        is_base64_encoded: Some(false),
        cookies: vec!(),
    };

    Ok(response)
}

#[cfg(test)]
mod tests {
    use super::*;
    use http::Method;
    use std::collections::hash_map::HashMap;
    use aws_lambda_events::event::apigw::{ApiGatewayV2httpRequestContext, ApiGatewayV2httpRequestContextHttpDescription};
    use chrono::Utc;

    #[tokio::test]
    async fn echo_handles() {
        // Create test request
        let request = ApiGatewayV2httpRequest {
            version: None,
            route_key: None,
            raw_path: Some(String::from("/")),
            raw_query_string: None,
            cookies: None,
            headers: HeaderMap::new(),
            query_string_parameters: HashMap::new(),
            path_parameters: HashMap::new(),
            request_context: ApiGatewayV2httpRequestContext {
                route_key: None,
                account_id: None,
                stage: None,
                request_id: None,
                authorizer: None,
                apiid: None,
                domain_name: None,
                domain_prefix: None,
                time: None,
                time_epoch: Utc::now().timestamp(),
                http: ApiGatewayV2httpRequestContextHttpDescription {
                    method: Method::GET,
                    path: Some(String::from("/")),
                    protocol: None,
                    source_ip: None,
                    user_agent: None,
                },
            },
            stage_variables: HashMap::new(),
            body: None,
            is_base64_encoded: false,
        };

        // Create test expected response
        let mut response_headers = HeaderMap::new();

        response_headers.insert(http::header::CONTENT_TYPE, "text/plain".parse().unwrap());

        let response_body = encodings::Body::from("Hello from Rust! You've reached another endpoint, /");

        let response_expected = ApiGatewayV2httpResponse {
            status_code: 200,
            headers: response_headers,
            multi_value_headers: HeaderMap::new(),
            body: Some(response_body),
            is_base64_encoded: Some(false),
            cookies: vec!(),
        };

        // Perform assertion
        assert_eq!(
            echo(request.clone(), Context::default()).await.expect("expected OK_ value"),
            response_expected
        );
    }
}
