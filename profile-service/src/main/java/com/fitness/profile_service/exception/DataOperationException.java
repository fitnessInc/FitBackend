package com.fitness.profile_service.exception;

import lombok.Getter;

@Getter
public class DataOperationException extends RuntimeException{

    private final DataOperationExceptionType type;

    public DataOperationException(String message, DataOperationExceptionType type) {
        super(message);
        this.type = type;
    }
}
