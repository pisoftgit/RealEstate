import Property from "../assets/svg/property.svg"
import Loc from "../assets/svg/loc.svg"
import CRM from "../assets/svg/CRM.svg"
import Brief from "../assets/svg/breif.svg"

export const defaultModules   = [
    {
      name: "Home",
      path: "/(drawer)/(tabs)/Home",
      title: "Home",
      icon: Property,
      alwaysVisible: true
     
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
          name:"Leaves",
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
          name:"MovementRegister",
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
      name:"CRM",
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
            name: "AddProperties",
            path: "/(drawer)/InventoryManagement/AddProperties",
            title: "Add Properties",
          },
          {
            name: "ManageProperties",
            path: "/(drawer)/InventoryManagement/ManageProperties",
            title: "Manage Properties",
          },
          {
            name: "FollowUp",
            path: "/(drawer)/InventoryManagement/FollowUp",
            title: "Follow Up",
          },
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
      {
        name: "Geolocation",
        path: "/(drawer)/Geolocation",
        title: "Geolocation",
        icon: Loc,
      },
      {
        name: "MarkAttendence",
        path: "/(drawer)/MarkAttendence",
        title: "My Attendance",
        icon: CRM,
        alwaysVisible: true
      },
    
  ];
