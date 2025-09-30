import Property from "../assets/svg/property.svg"
import Loc from "../assets/svg/loc.svg"
import CRM from "../assets/svg/CRM.svg"
import Brief from "../assets/svg/breif.svg"

export const defaultModules = [
  {
    name: "Home",
    path: "/(drawer)/(tabs)/Home",
    title: "Home",
    icon: Property,
    alwaysVisible: true

  },
  {
    name: "Administrative",
    path: "/(drawer)/Administrative",
    title: "Administrative",
    icon: Brief,
    children: [
      {
        name: "Property",
        path: "/(drawer)/Administrative/Property",
        title: "Property",
        icon: Brief,
        children: [
          {
            name: "Businessnature",
            path: "/(drawer)/Adminstrative/Property/Businessnature",
            title: "Business Nature",
          },
          {
            name: "PropertyNature",
            path: "/(drawer)/Adminstrative/Property/PropertyNature",
            title: "Property Nature",
          },
          {
            name: "PropertyType",
            path: "/(drawer)/Adminstrative/Property/ProptertyType",
            title: "Property Type",
          },
          {
            name: "SubPropertyType",
            path: "/(drawer)/Adminstrative/Property/SubPropertyType",
            title: "Sub Property Type",
          },
          {
            name: "Propertyitem",
            path: "/(drawer)/Adminstrative/Property/PropertyItem",
            title: "Property Item",
          },
          {
            name: "Rera",
            path: "/(drawer)/Adminstrative/Property/Rera",
            title: "RERA",
          },
          {
            name: "facedirection",
            path: "/(drawer)/Adminstrative/Property/FaceDirection",
            title: "Face Direction",
          },
          {
            name: "Facilities",
            path: "/(drawer)/Adminstrative/Property/Facility",
            title: "Facility",
          },
          {
            name: "Amenities",
            path: "/(drawer)/Adminstrative/Property/Amenity",
            title: "Amenity",
          },
          {
            name: "Furnishings",
            path: "/(drawer)/Adminstrative/Property/FunishingStatus",
            title: "Furnishing Status",
          },
          {
            name: "StructureType",
            path: "/(drawer)/Adminstrative/Property/StructureType",
            title: "Flat/House Structure Type",
          },

        
      
      {
        name: "Type",
        path: "/(drawer)/Adminstrative/Type",
        title: "Type",
        icon: Brief,
        children: [
          {
            name: "Structure",
            path: "/(drawer)/Adminstrative/Type/Structure",
            title: "Flat/House Structure",
          },
          {
            name: "RoomType",
            path: "/(drawer)/Adminstrative/Type/RoomType",
            title: "Room Type",
          },
          {
            name: "ParkingType",
            path: "/(drawer)/Adminstrative/Type/ParkingType",
            title: "Parking Type",
          },
          {
            name: "Ownershiptype",
            path: "/(drawer)/Adminstrative/Type/Ownershiptype",
            title: "Ownership Type",
          },
          {
            name: "ShopShowroom",
            path: "/(drawer)/Adminstrative/Type/Shopshowroom",
            title: "Shop/Showroom Category",
          },
          {
            name: "MeasurementUnit",
            path: "/(drawer)/Adminstrative/Type/MeasurementUnit",
            title: "Measurement Unit",
          }
        ]
      }
      ]
      },
    ]
  },
  {
    name: "HR",
    path: "/(drawer)/HR",
    title: "HR",
    icon: Brief,
    children: [

      {
        name: "E-Manage",
        path: "/(drawer)/HR/E-Manage",
        title: "Employee Management",
        children: [
          {
            name: "AddEmp",
            path: "/(drawer)/HR/E-Manage/AddEmp",
            title: "Add Employee",
          },
          {
            name: "ViewUpEmp",
            path: "/(drawer)/HR/E-Manage/ViewUpEmp",
            title: "View/Update Employee",
          },
          {
            name: "MarkAttend",
            path: "/(drawer)/HR/E-Manage/MarkAttend",
            title: "Employee Attendence",
          },

        ],
      },
      {
        name: "E-Status",
        path: "/(drawer)/HR/E-Status",
        title: "Employee Status",
        children: [
          {
            name: "ExistingEmployees",
            path: "/(drawer)/HR/E-Status/ExistingEmployees",
            title: "Update Status",
          },

        ],
      },
      {
        name: "E-Salary",
        path: "/(drawer)/HR/E-Salary",
        title: "Employee Salary",
        children: [
          {
            name: "MonthlySalary",
            path: "/(drawer)/HR/E-Salary/MonthlySalary",
            title: "Monthly Salary",
          },
          {
            name: "ViewSalary",
            path: "/(drawer)/HR/E-Salary/ViewSalary",
            title: "View Salary",
          },

        ],
      },
      {
        name: "Leaves",
        path: "/(drawer)/HR/Leaves",
        title: "Leaves",


        children: [
          {
            name: "ApplyLeave",
            path: "/(drawer)/HR/Leaves/ApplyLeave",
            title: "Apply Leave",
            // alwaysVisible: true
          },
          {
            name: "ManageLeaves",
            path: "/(drawer)/HR/Leaves/ManageLeaves",
            title: "Manage Leave",
            // alwaysVisible: true

          },
        ]

      },
      {
        name: "MovementRegister",
        path: "/(drawer)/HR/MovementRegister",
        title: "Movement Register",


        children: [
          {
            name: "MovementRequest",
            path: "/(drawer)/HR/MovementRegister/MovementRequest",
            title: "Movement Request",
            // alwaysVisible: true
          },

          {
            name: "ManageMovement",
            path: "/(drawer)/HR/MovementRegister/ManageMovement",
            title: "Manage Movement",
            // alwaysVisible: true
          },
        ]

      },

    ],
  },



  {
    name: "CRM",
    path: "/(drawer)/CRM",
    title: "CRM",

    icon: CRM,
    children: [
      {
        name: "AddLeads",
        path: "/(drawer)/CRM/AddLeads",
        title: "Add Leads",
      },
      {
        name: "ManageLeads",
        path: "/(drawer)/CRM/ManageLeads",
        title: "Manage Leads",

      },
      {
        name: "Appointments",
        path: "/(drawer)/CRM/Appointments",
        title: "Appointments",

      },
      {
        name: "AddCustomer",
        path: "/(drawer)/CRM/AddCustomer",
        title: "Add Customer",

      },
      {
        name: "ManageCustomers",
        path: "/(drawer)/CRM/ManageCustomers",
        title: "Manage Customers",

      },

    ]

  },

  {
    name: "InventoryManagement",
    path: "/(drawer)/InventoryManagement",
    title: "Inventory Management",
    icon: Brief,
    children: [





      {
        name: "Project",
        path: "/(drawer)/InventoryManagement/Project",
        title: "Project",

        icon: Brief,
        children: [
          {
            name: "AddProjects",
            path: "/(drawer)/InventoryManagement/Project/AddProjects",
            title: "Add Projects",
          },
          {
            name: "ManageProjects",
            path: "/(drawer)/InventoryManagement/Project/ManageProjects",
            title: "Manage Projects",
          },
        ],
      },
      
      {
        name: "Realtor",
        path: "/(drawer)/InventoryManagement/Builder",
        title: "Realtor",

        icon: Brief,
        children: [
          {
            name: "AddBuilder",
            path: "/(drawer)/InventoryManagement/Builder/AddBuilder",
            title: "Add Realtor",
          },
          {
            name: "ManageBuilder",
            path: "/(drawer)/InventoryManagement/Builder/ManageBuilder",
            title: "Manage Realtor",
          },
        ],
      },
      // {
      //   name: "FollowUp",
      //   path: "/(drawer)/InventoryManagement/FollowUp",
      //   title: "Follow Up",
      // },
    ],
  },
  {
    name: "EmployeeLocation",
    path: "/(drawer)/EmployeeLocation",
    title: "Employee Location",

    icon: Brief,
    children: [
      {
        name: "location",
        path: "/(drawer)/EmployeeLocation/ViewEmpLocation",
        title: "Employee Location",
        icon: Loc,
      },
    ]
  },
  // {
  //   name: "Geolocation",
  //   path: "/(drawer)/Geolocation",
  //   title: "Geolocation",
  //   icon: Loc,
  // },
  {
    name: "MarkAttendence",
    path: "/(drawer)/MarkAttendence",
    title: "My Attendance",
    icon: CRM,
    alwaysVisible: true
  },

];
