package com.fitness.profile_service.service;

import com.fitness.profile_service.model.Profile;
import com.fitness.profile_service.model.SearchFilter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProfileService {

    Page<Profile> getAllProfiles(SearchFilter filter, Pageable pageable);
    Profile findById(Long id);

    Profile createProfile(Profile profile);
    Profile updateProfile(Profile profile);
    void deleteProfile(Long id);


}
