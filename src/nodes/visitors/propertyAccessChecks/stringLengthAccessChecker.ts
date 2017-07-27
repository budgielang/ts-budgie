import { CommandNames } from "general-language-syntax";

import { GlsLine } from "../../../glsLine";
import { IAccessCredentials, PropertyAccessChecker } from "./propertyAccessChecker";

export class StringLengthAccessChecker extends PropertyAccessChecker {
    public attemptVisit(credentials: IAccessCredentials): GlsLine | undefined {
        if (credentials.expressionAlias !== "string" || credentials.name.getText(this.sourceFile) !== "length") {
            return undefined;
        }

        return new GlsLine(CommandNames.StringLength, credentials.expression.getText(this.sourceFile));
    }
}
