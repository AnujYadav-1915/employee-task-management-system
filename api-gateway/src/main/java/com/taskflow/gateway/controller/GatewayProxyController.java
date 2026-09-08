package com.taskflow.gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Collections;
import java.util.Enumeration;

@RestController
public class GatewayProxyController {

    private final RestTemplate restTemplate;

    @Value("${services.auth.url}")
    private String authServiceUrl;

    @Value("${services.user.url}")
    private String userServiceUrl;

    @Value("${services.task.url}")
    private String taskServiceUrl;

    @Value("${services.notification.url}")
    private String notificationServiceUrl;

    public GatewayProxyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @RequestMapping(value = "/api/auth/**")
    public ResponseEntity<byte[]> proxyAuth(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return forwardRequest(request, body, authServiceUrl);
    }

    @RequestMapping(value = "/api/employees/**")
    public ResponseEntity<byte[]> proxyEmployees(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return forwardRequest(request, body, userServiceUrl);
    }

    @RequestMapping(value = "/api/tasks/**")
    public ResponseEntity<byte[]> proxyTasks(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return forwardRequest(request, body, taskServiceUrl);
    }

    @RequestMapping(value = "/api/notifications/**")
    public ResponseEntity<byte[]> proxyNotifications(HttpServletRequest request, @RequestBody(required = false) byte[] body) {
        return forwardRequest(request, body, notificationServiceUrl);
    }

    private ResponseEntity<byte[]> forwardRequest(HttpServletRequest request, byte[] body, String targetBaseUrl) {
        try {
            String path = request.getRequestURI();
            String query = request.getQueryString();
            String targetUrl = targetBaseUrl + path + (query != null ? "?" + query : "");

            HttpMethod method = HttpMethod.valueOf(request.getMethod());
            HttpHeaders headers = new HttpHeaders();

            Enumeration<String> headerNames = request.getHeaderNames();
            if (headerNames != null) {
                while (headerNames.hasMoreElements()) {
                    String headerName = headerNames.nextElement();
                    if (!headerName.equalsIgnoreCase(HttpHeaders.HOST) &&
                        !headerName.equalsIgnoreCase(HttpHeaders.CONTENT_LENGTH)) {
                        headers.put(headerName, Collections.list(request.getHeaders(headerName)));
                    }
                }
            }

            HttpEntity<byte[]> entity = new HttpEntity<>(body, headers);
            return restTemplate.exchange(URI.create(targetUrl), method, entity, byte[].class);
        } catch (HttpStatusCodeException ex) {
            HttpHeaders responseHeaders = new HttpHeaders();
            ex.getResponseHeaders().forEach((name, values) -> {
                if (!name.equalsIgnoreCase(HttpHeaders.TRANSFER_ENCODING)) {
                    responseHeaders.put(name, values);
                }
            });
            return new ResponseEntity<>(ex.getResponseBodyAsByteArray(), responseHeaders, ex.getStatusCode());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(("{\"error\": \"Service unavailable: " + ex.getMessage() + "\"}").getBytes());
        }
    }
}
