package com.fitness.profile_service.model.dto;

import com.fitness.profile_service.model.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class ProfileDTO {
    @NotBlank(message = "Firstname is required")
    private String firstname;
    @NotBlank(message = "Lastname is required")
    private String lastname;
    @Email(message = "Email must be a valid address")
    @NotBlank(message = "Email is required")
    private String email;
    @Size(max=10, message = "Phone number should be 10 digits")
    private String phoneNumber;
    @Past(message = "Birthdate must be in the past")
    private Date birthdate;
    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "MALE|FEMALE|OTHER", flags = Pattern.Flag.CASE_INSENSITIVE)
    private String gender;
    @Size(max = 500, message = "Biography should be less than 500 characters")
    private String bio;
    //  the user_id gonna be a unique one
    private Long user_id;
    private Timestamp cratedAt;
    private Timestamp updatedAt;
}
