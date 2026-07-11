import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { parsethecsv } from "../services/csvstream.js";

const importfile = asynchandler(async (req, res) => {
    const file = req.file;

    if (!file) {
        throw new ApiError(400, "Please upload a valid CSV file."); 
    }

    const filepath = file.path;

    const processResult = await parsethecsv(filepath);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                processResult, 
                "CSV parsed and CRM leads processed successfully with AI."
            )
        );
});

export { importfile };