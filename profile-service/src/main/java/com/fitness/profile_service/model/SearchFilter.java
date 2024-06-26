package com.fitness.profile_service.model;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SearchFilter {

   private String email;
   private String firstname;
   private String lastname;
   private String gender;
}
