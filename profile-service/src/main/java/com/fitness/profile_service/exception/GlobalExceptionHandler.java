package com.fitness.profile_service.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataOperationException.class)
    private ResponseEntity<?> handleOperationException(DataOperationException operationException) {
        return switch (operationException.getType()) {
            case NOT_FOUND -> {
                yield ResponseEntity.status(HttpStatus.NOT_FOUND).body(operationException.getMessage());
            }

            case CONFLICT -> {
                yield ResponseEntity.status(HttpStatus.CONFLICT).body(operationException.getMessage());
            }
            case UNKNOWN -> {
                yield ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(operationException.getMessage());
            }
        };
    }

    @ExceptionHandler(Exception.class)
    private ResponseEntity<?> handleException(Exception exception) {
        log.error(exception.getMessage());
        return ResponseEntity.internalServerError().body("Something went wrong. Please try later or contact an administrator");
    }
}
