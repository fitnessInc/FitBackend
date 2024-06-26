package com.fitness.profile_service.model;

import com.fitness.profile_service.model.enums.Gender;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.sql.Timestamp;
import java.util.Date;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String firstname;
    private String lastname;
    private String phoneNumber;
    private String email;
    private Date birthdate;
    private String gender;
    private String bio;
    private Long user_id;
    private Timestamp cratedAt;
    private Timestamp updatedAt;

}
