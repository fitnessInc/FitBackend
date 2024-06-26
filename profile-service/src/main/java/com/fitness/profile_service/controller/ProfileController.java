package com.fitness.profile_service.controller;

import com.fitness.profile_service.model.Profile;
import com.fitness.profile_service.model.SearchFilter;
import com.fitness.profile_service.model.dto.ProfileDTO;
import com.fitness.profile_service.service.ProfileService;
import com.fitness.profile_service.utils.ProfileMapper;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/profiles")
@AllArgsConstructor
public class ProfileController {

    private ProfileService profileService;

    @GetMapping
    public ResponseEntity<Page<ProfileDTO>> getAllProfiles(SearchFilter filter, Pageable pageable) {

        Page<Profile> profiles = profileService.getAllProfiles(filter, pageable);
        Page<ProfileDTO> profileDTOS = profiles.map(ProfileMapper::profileToDto);
        return ResponseEntity.ok(profileDTOS);
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> createProfile(@Valid @RequestBody ProfileDTO profileDTO) {

        Profile profile = ProfileMapper.dtoToProfile(profileDTO);
        var newprofile = profileService.createProfile(profile);

        return ResponseEntity.status(HttpStatus.CREATED).body(newprofile);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfileById(@PathVariable Long id) {
        var profile = profileService.findById(id);
        ProfileDTO profileDTO = ProfileMapper.profileToDto(profile);
        return ResponseEntity.ok(profileDTO);
    }

    @PutMapping(value = "/{id}", consumes = "application/json")
    public ResponseEntity<?> updatedProfile(@PathVariable Long id, @Valid @RequestBody ProfileDTO profileDTO){

        Profile profile = ProfileMapper.dtoToProfile(profileDTO);
        profile.setId(id);
        Profile savedProfile = profileService.updateProfile(profile);
        return ResponseEntity.status(HttpStatus.OK).body(ProfileMapper.profileToDto(savedProfile));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProfile(@PathVariable Long id) {

        profileService.deleteProfile(id);
        return ResponseEntity.status(HttpStatus.OK).body("Profile deleted successfully");
    }

}
