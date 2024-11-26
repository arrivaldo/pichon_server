 import Salary from '../models/Salary.js'
 import Employee from '../models/Employee.js'

 const addSalary = async (req, res) => {
         try {
             const {employeeId, comment, payDate} = req.body

            //  const totalSalary = parseInt(basicSalary) + parseInt(allowances) - parseInt(deductions)

             const newSalary = new Salary({
                 employeeId,
                 comment,
                //  netSalary: totalSalary,
                 payDate
             })

             await newSalary.save()

             return res.status(200).json({success: true})
         } catch(error) {
             return res.status(500).json({success: false, error: "Salary add server error" })
         }
 }



 const getSalary = async (req, res) => {
    try {

            const {id, role} = req.params;
            let salary
            if(role === "admin"){

                salary = await Salary.find({employeeId: id}).populate('employeeId', 'employeeId')
            }
            else {
                const employee = await Employee.findOne({userId: id})
                salary = await Salary.find({employeeId: employee._id}).populate('employeeId', 'employeeId')
                console.log(salary)
            }
            return res.status(200).json({success: true, salary})



        } catch(error) {
             return res.status(500).json({success: false, error: "Salary get server error" })
         }
 }

 export {addSalary, getSalary}