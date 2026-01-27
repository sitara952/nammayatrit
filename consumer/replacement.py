import os

PATH_TO_RELATE_WITH = "designSystem/colorPalette";

def replace_strings_in_files(folder_path, replacements):
    for root, _, files in os.walk(folder_path):
        relativelyFar = len(root.split('/'))
        relativePath = "/".join([".." for _i in range(relativelyFar - 2)])
        importString = f"import colors from '{relativePath}/{PATH_TO_RELATE_WITH}';"
        for file_name in files:
            file_path = os.path.join(root, file_name)
            if '.tsx' in file_name:
                with open(file_path, 'r', encoding='utf-8') as file:
                    file_contents = file.read()
                for target, replacement in replacements.items():
                    doubleQuoteColor = f'"{target}"'
                    singleQuoteColor = f"'{target}'"
                    withoutQuote = target
                    if doubleQuoteColor in file_contents:
                        if f"={doubleQuoteColor}" in file_contents or f"= {doubleQuoteColor}" in file_contents:
                            replacement = replacement.replace("$", "").replace("`", "")
                        file_contents = file_contents.replace(doubleQuoteColor, replacement)
                        if importString not in file_contents:
                            file_lines = file_contents.split("\n")
                            file_lines.insert(1, importString)
                            file_contents = "\n".join(file_lines)
                    if singleQuoteColor in file_contents:
                        if f"={doubleQuoteColor}" in file_contents or f"= {doubleQuoteColor}" in file_contents:
                            replacement = replacement.replace("$", "").replace("`", "")
                        file_contents = file_contents.replace(singleQuoteColor, replacement)
                        if importString not in file_contents:
                            file_lines = file_contents.split("\n")
                            file_lines.insert(1, importString)
                            file_contents = "\n".join(file_lines)
                    if singleQuoteColor not in file_contents and doubleQuoteColor not in file_contents and withoutQuote in file_contents:
                        fileSplit = file_contents.split("\n")
                        newLines = []
                        for line in fileSplit:
                            if target in line:
                                if "'" in line:
                                    lineSplit = line.split(target)
                                    newLine = lineSplit[0] + "' + " + replacement + " + '" +lineSplit[1]
                                    print(line)
                                    print(newLine)
                                    newLines.append(newLine)
                                elif "`" in line:
                                    replacement = replacement.replace("`", "")
                                    newLine = line.replace(withoutQuote, replacement)
                                    print(line)
                                    print(newLine)
                                    newLines.append(newLine)
                            else:
                                newLines.append(line)
                        file_contents = "\n".join(newLines)
                        if importString not in file_contents:
                            file_lines = file_contents.split("\n")
                            file_lines.insert(1, importString)
                            file_contents = "\n".join(file_lines)
                with open(file_path, 'w+', encoding='utf-8') as file:
                    file.write(file_contents)

folder_path = 'src/typescript'
replacements = {
    '#000000': '`${colors?.recovered?.neutralMax}`'
    , '#11032F': '`${colors?.recovered?.neutralMax}`'
    , '#161622': '`${colors?.recovered?.neutralMax}`'
    , '#17263c': '`${colors?.recovered?.neutralMax}`'
    , '#181821': '`${colors?.recovered?.neutralMax}`'
    , '#1f2835': '`${colors?.recovered?.neutralMax}`'
    , '#212121': '`${colors?.recovered?.neutralMax}`'
    , '#212a37': '`${colors?.recovered?.neutralMax}`'
    , '#242f3e': '`${colors?.recovered?.neutralMax}`'
    , '#252525': '`${colors?.recovered?.neutralMax}`'
    , '#263c3f': '`${colors?.recovered?.neutralUltraHigh}`'
    , '#2C2F3A': '`${colors?.recovered?.neutralUltraHigh}`'
    , '#2F2F2F': '`${colors?.recovered?.neutralUltraHigh}`'
    , '#2f3948': '`${colors?.recovered?.neutralUltraHigh}`'
    , '#313131': '`${colors?.recovered?.neutralUltraHigh}`'
    , '#332D39': '`${colors?.recovered?.neutralUltraHigh}`'
    , '#383838': '`${colors?.recovered?.neutralUltraHigh}`'
    , '#38414e': '`${colors?.recovered?.neutralUltraHigh}`'
    , '#454545': '`${colors?.recovered?.neutralUltraHigh}`'
    , '#515151': '`${colors?.recovered?.neutralUltraHigh}`'
    , '#515c6d': '`${colors?.recovered?.neutralHigh}`'
    , '#606060': '`${colors?.recovered?.neutralHigh}`'
    , '#655C6F': '`${colors?.recovered?.neutralHigh}`'
    , '#666666': '`${colors?.recovered?.neutralHigh}`'
    , '#686868': '`${colors?.recovered?.neutralHigh}`'
    , '#6D7280': '`${colors?.recovered?.neutralHigh}`'
    , '#959595': '`${colors?.recovered?.neutralMidHigh}`'
    , '#9ca5b3': '`${colors?.recovered?.neutralMid}`'
    , '#B5BBC5': '`${colors?.recovered?.neutralMid}`'
    , '#CACACA': '`${colors?.recovered?.neutralMidLow}`'
    , '#CCCCCC': '`${colors?.recovered?.neutralMidLow}`'
    , '#CFCFD5': '`${colors?.recovered?.neutralLow}`'
    , '#DCDFE4': '`${colors?.recovered?.neutralLow}`'
    , '#E5E7EB': '`${colors?.recovered?.neutralLow}`'
    , '#E6E5E6': '`${colors?.recovered?.neutralUltraLow}`'
    , '#F0F0F0': '`${colors?.recovered?.neutralUltraLow}`'
    , '#eeeeee': '`${colors?.recovered?.neutralUltraLow}`'
    , '#F0F5F2': '`${colors?.recovered?.neutralUltraLow}`'
    , '#FFFFFF': '`${colors?.recovered?.neutralMin}`'
    , '#F5EDFF': '`${colors?.recovered?.orangelUltraLow}`'
    , '#f3d19c': '`${colors?.recovered?.orangeLow}`'
    , '#D5C1FE': '`${colors?.recovered?.orangeLow}`'
    , '#8866FF': '`${colors?.recovered?.orangeMid}`'
    , '#7435FC': '`${colors?.recovered?.orangeMid}`'
    , '#9221FB': '`${colors?.recovered?.orangeMid}`'
    , '#9122FA': '`${colors?.recovered?.orangeMid}`'
    , '#8C1AFD': '`${colors?.recovered?.orangeMid}`'
    , '#8519FC': '`${colors?.recovered?.orangeMid}`'
    , '#7f11e0': '`${colors?.recovered?.orangeMid}`'
    , '#7C6095': '`${colors?.recovered?.orangeHigh}`'
    , '#4285F4': '`${colors?.recovered?.blue}`'
    , '#2196f3': '`${colors?.recovered?.blue}`'
    , '#4da2ab': '`${colors?.recovered?.teal}`'
    , '#007a87': '`${colors?.recovered?.teal}`'
    , '#1A471B': '`${colors?.recovered?.greenHigh}`'
    , '#238C23': '`${colors?.recovered?.greenMid}`'
    , '#00C806': '`${colors?.recovered?.greenMid}`'
    , '#6b9a76': '`${colors?.recovered?.greenMid}`'
    , '#ffeb3b': '`${colors?.recovered?.yellowMid}`'
    , '#FCC32C': '`${colors?.recovered?.yellowHigh}`'
    , '#FBA704': '`${colors?.recovered?.yellowHigh}`'
    , '#c5a620': '`${colors?.recovered?.salmon}`'
    , '#E5845C': '`${colors?.recovered?.salmon}`'
    , '#d59563': '`${colors?.recovered?.salmon}`'
    , '#746855': '`${colors?.recovered?.marsh}`'
    , '#FF3269': '`${colors?.recovered?.pinkRed}`'
    , '#FF5A5F': '`${colors?.recovered?.pinkRed}`'
    , '#f55959': '`${colors?.recovered?.pinkRed}`'
    , '#EA4848': '`${colors?.recovered?.pinkRed}`'
    , '#E55454': '`${colors?.recovered?.pinkRed}`'
    , '#D23F44': '`${colors?.recovered?.pinkRed}`'
    , '#B24112': '`${colors?.recovered?.brown}`'
    , '#7F0000': '`${colors?.recovered?.brown}`'
    , '#0066FF': '`${colors?.recovered?.blueHigh}`'
    , '#B2B9C7': '`${colors?.recovered?.greyMid}`'
    , '#5B6777': '`${colors?.recovered?.greyHigh}`'
    , '#857F88': '`${colors?.primitive?.grey?.[7]}`'
    , '#1C4188': '`${colors?.recovered?.blueMax}`'
    , '#14A255': '`${colors?.recovered?.greenMidHigh}`'
}

replace_strings_in_files(folder_path, replacements)



