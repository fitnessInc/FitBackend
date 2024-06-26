package com.fitness.profile_service.service.impl;

import com.fitness.profile_service.exception.DataOperationException;
import com.fitness.profile_service.exception.DataOperationExceptionType;
import com.fitness.profile_service.model.Profile;
import com.fitness.profile_service.model.SearchFilter;
import com.fitness.profile_service.model.enums.Gender;
import com.fitness.profile_service.repository.ProfileRepository;
import com.fitness.profile_service.service.ProfileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class ProfileServiceImpl implements ProfileService {

    ProfileRepository profileRepository;

    public ProfileServiceImpl(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Override
    public Page<Profile> getAllProfiles(SearchFilter filter, Pageable pageable) {
        Assert.notNull(pageable, "Pageable must not be null");

        try{
            if(filter == null || (
                    filter.getFirstname() == null &&
                    filter.getLastname() == null &&
                    filter.getEmail() == null &&
                    filter.getGender() == null
                    )) {
                return profileRepository.findAll(pageable);
            }

            Profile profile = new Profile();
            if(filter.getFirstname() != null && !filter.getFirstname().isBlank()) {
                profile.setFirstname(filter.getFirstname());
            }

            if(filter.getLastname() != null && !filter.getLastname().isBlank()) {
                profile.setLastname(filter.getLastname());
            }

            if(filter.getEmail() != null && !filter.getEmail().isBlank()) {
                profile.setEmail(filter.getEmail());
            }

            if(filter.getGender() != null && !filter.getGender().isBlank()) {
                profile.setGender(filter.getGender());
            }

            Example<Profile> example = Example.of(profile, ExampleMatcher.matchingAny());
            return profileRepository.findAll(example, pageable);

        } catch (Exception e) {
            var message = "Error while trying to retrieve profiles";
            log.error(message, e);
            throw new DataOperationException(message, DataOperationExceptionType.UNKNOWN);
        }
    }

    @Override
    public Profile findById(Long id) {
        Assert.notNull(id, "id must not be null");
        Optional<Profile> profile;
        try{
            profile = profileRepository.findById(id);

            if(profile.isEmpty()) {
                throw new DataOperationException("Profile not found with the given \"%s\"".formatted(id), DataOperationExceptionType.NOT_FOUND);
            }
        } catch (Exception e) {

            if(e instanceof DataOperationException) {
                log.info("Profile not found");
                throw e;
            }

            var message = "Profile not found with the given \"%s\"".formatted(id);
            log.error(message, e);
            throw new DataOperationException("Error while trying to get the profile", DataOperationExceptionType.UNKNOWN);

        }
        return profile.get();
    }

    @Override
    public Profile createProfile(Profile profile) {
        Assert.notNull(profile, "Profile must not be null");

        Profile createdProfile;
        try {
            var exist = profileRepository.exists(Example.of(Profile.builder().email(profile.getEmail()).build(), ExampleMatcher.matchingAny()));

            if(exist)
                throw new DataOperationException("Profile already exists", DataOperationExceptionType.CONFLICT);
            //save profile in database
            profile.setCratedAt(new Timestamp(new Date().getTime()));
            profile.setUpdatedAt(new Timestamp(new Date().getTime()));
            createdProfile = profileRepository.save(profile);

        } catch(Exception e) {

            if(e instanceof DataOperationException) {
                log.info("Profile already exist");
                throw e;
            }

            var message = "Error while trying to create profile";
            log.error(message, e);
            throw new DataOperationException("Error while trying to create profile", DataOperationExceptionType.UNKNOWN);

        }
        return createdProfile;
    }

    @Override
    public Profile updateProfile(Profile profile) {
        Assert.notNull(profile, "Profile must not be null");
        Assert.isTrue(profile.getId() !=null && !profile.getId().toString().isBlank(), "Profile id must be provided");
        Optional<Profile> existedProfile;
        Profile updatedProfile;

        try{
            existedProfile = profileRepository.findById(profile.getId());

            if(existedProfile.isEmpty())
                throw new DataOperationException("Profile not found", DataOperationExceptionType.NOT_FOUND);

           updatedProfile =  profileRepository.save(profile);
        } catch (Exception e) {
            if(e instanceof DataOperationException) {
                log.info("Profile not found");
                throw e;
            }
            var message = "Error while trying to update the profile";
            throw new DataOperationException(message, DataOperationExceptionType.UNKNOWN);
        }

        return updatedProfile;
    }

    @Override
    public void deleteProfile(Long id) {
        Assert.notNull(id, "ID must not be bull");

        try{
            Optional<Profile> profile = profileRepository.findById(id);
            if(profile.isEmpty())
                throw new DataOperationException("Profile not found with the given \"%s\"".formatted(id), DataOperationExceptionType.NOT_FOUND);
            profileRepository.delete(profile.get());
        } catch (Exception e) {
            if(e instanceof DataOperationException){
                log.info("Profile not found");
                throw e;
            }
            var message = "Error while trying to delete profile";
            throw new DataOperationException(message, DataOperationExceptionType.UNKNOWN);

        }
    }
}
