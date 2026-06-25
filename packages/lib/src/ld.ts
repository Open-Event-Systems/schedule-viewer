/**
 * JSON-LD types.
 * @module
 */

export type JSONLDHierarchyObject = Readonly<{
  name?: string
  subtypes?: JSONLDRootHierarchyObject
}>

export type JSONLDRootHierarchyObject = Readonly<{
  [key: string]: JSONLDHierarchyObject
}>

export type JSONLDTypesFromHierarchy<H> = H extends JSONLDRootHierarchyObject
  ?
      | keyof H
      | {
          [K in keyof H]: JSONLDTypesFromHierarchy<H[K]["subtypes"]>
        }[keyof H]
  : never

export const EVENT_TYPES = {
  Event: {
    subtypes: {
      BusinessEvent: {},
      ChildrensEvent: {},
      ComedyEvent: {},
      ConferenceEvent: {},
      CourseInstance: {},
      DanceEvent: {},
      DeliveryEvent: {},
      EducationEvent: {},
      EventSeries: {},
      ExhibitionEvent: {},
      Festival: {},
      FoodEvent: {},
      Hackathon: {},
      LiteraryEvent: {},
      MusicEvent: {},
      PerformingArtsEvent: {},
      PublicationEvent: {
        subtypes: {
          BroadcastEvent: {},
          OnDemandEvent: {},
        },
      },
      SaleEvent: {},
      ScreeningEvent: {},
      SocialEvent: {},
      SportsEvent: {},
      TheaterEvent: {},
      VisualArtsEvent: {},
    },
  },
} as const satisfies JSONLDRootHierarchyObject

export const LOCAL_BUSINESS_TYPES = {
  LocalBusiness: {
    subtypes: {
      AnimalShelter: {},
      ArchiveOrganization: {},
      AutomotiveBusiness: {
        subtypes: {
          AutoBodyShop: {},
          AutoDealer: {},
          AutoPartsStore: {},
          AutoRental: {},
          AutoRepair: {},
          AutoWash: {},
          GasStation: {},
          MotorcycleDealer: {},
          MotorcycleRepair: {},
        },
      },
      ChildCare: {},
      Dentist: {},
      DryCleaningOrLaundry: {},
      EmergencyService: {
        subtypes: {
          FireStation: {},
          Hospital: {},
          PoliceStation: {},
        },
      },
      EmploymentAgency: {},
      EntertainmentBusiness: {
        subtypes: {
          AdultEntertainment: {},
          AmusementPark: {},
          ArtGallery: {},
          Casino: {},
          ComedyClub: {},
          MovieTheater: {},
          NightClub: {},
        },
      },
      FinancialService: {
        subtypes: {
          AccountingService: {},
          AutomatedTeller: {},
          BankOrCreditUnion: {},
          InsuranceAgency: {},
        },
      },
      FoodEstablishment: {
        subtypes: {
          Bakery: {},
          BarOrPub: {},
          Brewery: {},
          CafeOrCoffeeShop: {},
          Distillery: {},
          FastFoodRestaurant: {},
          IceCreamShop: {},
          Restaurant: {},
          Winery: {},
        },
      },
      GovernmentOffice: {
        subtypes: {
          PostOffice: {},
        },
      },
      HealthAndBeautyBusiness: {
        subtypes: {
          BeautySalon: {},
          DaySpa: {},
          HairSalon: {},
          HealthClub: {},
          NailSalon: {},
          TattooParlor: {},
        },
      },
      HomeAndConstructionBusiness: {
        subtypes: {
          Electrician: {},
          GeneralContractor: {},
          HVACBusiness: {},
          HousePainter: {},
          Locksmith: {},
          MovingCompany: {},
          Plumber: {},
          RoofingContractor: {},
        },
      },
      InternetCafe: {},
      LegalService: {
        subtypes: {
          Attorney: {},
          Notary: {},
        },
      },
      Library: {},
      LodgingBusiness: {
        subtypes: {
          BedAndBreakfast: {},
          Campground: {},
          Hostel: {},
          Hotel: {},
          Motel: {},
          Resort: {
            subtypes: {
              SkiResort: {},
            },
          },

          VacationRental: {},
        },
      },
      MedicalBusiness: {
        subtypes: {
          CommunityHealth: {},
          Dentist: {},
          Dermatology: {},
          DietNutrition: {},
          Emergency: {},
          Geriatric: {},
          Gynecologic: {},
          MedicalClinic: {
            subtypes: {
              CovidTestingFacility: {},
            },
          },
          Midwifery: {},
          Nursing: {},
          Obstetric: {},
          Oncologic: {},
          Optician: {},
          Optometric: {},
          Otolaryngologic: {},
          Pediatric: {},
          Pharmacy: {},
          Physician: {
            subtypes: {
              IndividualPhysician: {},
              PhysiciansOffice: {},
            },
          },
          Physiotherapy: {},
          PlasticSurgery: {},
          Podiatric: {},
          PrimaryCare: {},
          Psychiatric: {},
          PublicHealth: {},
        },
      },
      ProfessionalService: {},
      RadioStation: {},
      RealEstateAgent: {},
      RecyclingCenter: {},
      SelfStorage: {},
      ShoppingCenter: {},
      SportsActivityLocation: {
        subtypes: {
          BowlingAlley: {},
          ExerciseGym: {},
          GolfCourse: {},
          HealthClub: {},
          PublicSwimmingPool: {},
          SkiResort: {},
          SportsClub: {},
          StadiumOrArena: {},
          TennisComplex: {},
        },
      },
      Store: {
        subtypes: {
          AutoPartsStore: {},
          BikeStore: {},
          BookStore: {},
          ClothingStore: {},
          ComputerStore: {},
          ConvenienceStore: {},
          DepartmentStore: {},
          ElectronicsStore: {},
          Florist: {},
          FurnitureStore: {},
          GardenStore: {},
          GroceryStore: {},
          HardwareStore: {},
          HobbyShop: {},
          HomeGoodsStore: {},
          JewelryStore: {},
          LiquorStore: {},
          MensClothingStore: {},
          MobilePhoneStore: {},
          MovieRentalStore: {},
          MusicStore: {},
          OfficeEquipmentStore: {},
          OutletStore: {},
          PawnShop: {},
          PetStore: {},
          ShoeStore: {},
          SportingGoodsStore: {},
          TireShop: {},
          ToyStore: {},
          WholesaleStore: {},
        },
      },
      TelevisionStation: {},
      TouristInformationCenter: {},
      TravelAgency: {},
    },
  },
} as const satisfies JSONLDRootHierarchyObject

export const ORGANIZATION_TYPES = {
  Organization: {
    subtypes: {
      Airline: {},
      Consortium: {},
      Cooperative: {},
      Corporation: {},
      EducationalOrganization: {
        subtypes: {
          CollegeOrUniversity: {},
          ElementarySchool: {},
          HighSchool: {},
          MiddleSchool: {},
          Preschool: {},
          School: {},
        },
      },
      FundingScheme: {},
      GovernmentOrganization: {},
      LibrarySystem: {},
      ...LOCAL_BUSINESS_TYPES,
      MedicalOrganization: {
        subtypes: {
          Dentist: {},
          DiagnosticLab: {},
          Hospital: {},
          MedicalClinic: {},
          Pharmacy: {},
          Physician: {},
          VeterinaryCare: {},
        },
      },
      NGO: {},
      NewsMediaOrganization: {},
      OnlineBusiness: {
        subtypes: {
          OnlineStore: {
            subtypes: {
              OnlineMarketplace: {},
            },
          },
        },
      },
      PerformingGroup: {
        subtypes: {
          DanceGroup: {},
          MusicGroup: {},
          TheaterGroup: {},
        },
      },
      PoliticalParty: {},
      Project: {
        subtypes: {
          FundingAgency: {},
          ResearchProject: {},
        },
      },
      ResearchOrganization: {},
      SearchRescueOrganization: {},
      SportsOrganization: {
        subtypes: {
          SportsTeam: {},
        },
      },
      WorkersUnion: {},
    },
  },
} as const satisfies JSONLDRootHierarchyObject

/**
 * Get JSON-LD types from a {@link JSONLDRootHierarchyObject} object.
 */
export const getJSONLDTypesFromHierarchy = <
  H extends JSONLDRootHierarchyObject,
>(
  h: H,
): JSONLDTypesFromHierarchy<H>[] => {
  const getTypes = function* <H extends JSONLDRootHierarchyObject>(
    h: H,
  ): Generator<string, void, unknown> {
    for (const key of Object.keys(h)) {
      yield key
      const subtypes = h[key]?.subtypes
      if (subtypes) {
        yield* getTypes(subtypes)
      }
    }
  }

  return [...getTypes(h)] as JSONLDTypesFromHierarchy<H>[]
}
