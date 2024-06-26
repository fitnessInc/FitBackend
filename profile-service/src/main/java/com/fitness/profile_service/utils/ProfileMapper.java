package com.fitness.profile_service.utils;

import com.fitness.profile_service.model.Profile;
import com.fitness.profile_service.model.dto.ProfileDTO;
import org.springframework.stereotype.Service;

@Service
public final class ProfileMapper {

    public static Profile dtoToProfile(ProfileDTO profileDTO) {
        return Profile.builder()
                .firstname(profileDTO.getFirstname())
                .lastname(profileDTO.getLastname())
                .email(profileDTO.getEmail())
                .birthdate(profileDTO.getBirthdate())
                .gender(profileDTO.getGender())
                .bio(profileDTO.getBio())
                .phoneNumber(profileDTO.getPhoneNumber())
                .user_id(profileDTO.getUser_id())
                .build();
    }

    public static ProfileDTO profileToDto(Profile profile){
        return ProfileDTO.builder()
                .firstname(profile.getFirstname())
                .lastname(profile.getLastname())
                .email(profile.getEmail())
                .birthdate(profile.getBirthdate())
                .gender(profile.getGender())
                .bio(profile.getBio())
                .phoneNumber(profile.getPhoneNumber())
                .user_id(profile.getUser_id())
                .build();
    }
}
