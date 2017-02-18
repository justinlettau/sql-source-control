module.exports = {

    /**
     * Get idempotency script prefix.
     *
     * @param item Row from query.
     * @returns String for use in script.
     */
    idempotency: function (item, type) {
        if (type === 'if-exists-drop') {
            // if exists drop
            return [
                `if exists (select * from sys.objects where object_id = object_id('[${item.schema}].[${item.name}]') and type = '${item.type}')`,
                `drop procedure [${item.schema}].[${item.name}]`,
                `go`,
                `\n`
            ].join('\n');
        } else if (type === 'if-not-exists') {
            // if not exists
            return `if not exists (select * from sys.objects where object_id = object_id('[${item.schema}].[${item.name}]') and type = '${item.type}')\n`;
        }

        // none
        return '';
    },

    /**
     * Get script for table's column.
     *
     * @param item Row from `sys.columns` query.
     * @param columns Array of records from `sys.columns` query.
     * @param primaryKeys Array of records from `sys.primaryKeys` query.
     * @param forgeinKeys Array of records from `sys.forgeinKeys` query.
     * @param indexes Array of records from `sys.indexes` query.
     * @returns String for use in table script.
     */
    table: function (item, columns, primaryKeys, forgeinKeys, indexes) {
        let output = `create table [${item.schema}].[${item.name}]\n`;
        output += `(\n`;

        // columns
        for (let col of columns.filter(x => x.object_id === item.object_id)) {
            output += '    ' + this.column(col) + '\n';
        }

        // primary keys
        for (let pk of primaryKeys.filter(x => x.object_id === item.object_id)) {
            output += '    ' + this.primaryKey(pk) + '\n';
        }

        // forgein keys
        for (let fk of forgeinKeys.filter(x => x.object_id === item.object_id)) {
            output += '    ' + this.forgeinKey(fk) + '\n';
        }

        output += `)\n`;
        output += 'go\n';
        output += '\n';

        // indexes
        for (let ix of indexes.filter(x => x.object_id === item.object_id)) {
            output += this.index(ix) + '\n';
        }

        output += 'go';
        return output;
    },

    /**
     * Get script for table's column.
     *
     * @param item Row from `sys.columns` query.
     * @returns String for use in table script.
     */
    column: function (item) {
        let output = `,[${item.name}]`;

        if (item.is_computed) {
            output += ` as ${item.definition}`;
        }

        output += ` ${item.datatype}`;

        switch (item.datatype) {
            case 'varchar':
            case 'char':
            case 'varbinary':
            case 'binary':
            case 'text':
                output += '(' + (item.max_length === -1 ? 'max' : item.max_length) + ')';
                break;
            case 'nvarchar':
            case 'nchar':
            case 'ntext':
                output += '(' + (item.max_length === -1 ? 'max' : item.max_length / 2) + ')';
                break;
            case 'datetime2':
            case 'time2':
            case 'datetimeoffset':
                output += '(' + item.scale + ')';
                break;
            case 'decimal':
                output += '(' + item.precision + ', ' + item.scale + ')';
                break;
        }

        if (item.collation_name) {
            output += ` collate ${item.collation_name}`;
        }

        output += item.is_nullable ? ' null' : ' not null';

        if (item.definition) {
            output += ` default${item.definition}`;
        }

        if (item.is_identity) {
            output += ` identity(${item.seed_value || 0}, ${item.increment_value || 1})`;
        }

        return output;
    },

    /**
     * Get script for table's primary key.
     *
     * @param item Row from `sys.primaryKeys` query.
     * @returns String for use in table script.
     */
    primaryKey: function (item) {
        return `,constraint [${item.name}] primary key ([${item.column}], ${item.is_descending_key ? 'desc' : 'asc'})`;
    },

    /**
     * Get script for table's forgein key.
     *
     * @param item Row from `sys.forgeinKeys` query.
     * @returns String for use in table script.
     */
    forgeinKey: function (item) {
        let output = `alter table [${item.schema}].[${item.table}] with ${item.is_not_trusted ? 'nocheck' : 'check'}`;
        output += ` add contraint [${item.name}] forgein key([${item.column}])`;
        output += ` references [${item.schema}].[${item.table}] ([${item.reference}])`;

        switch (item.delete_referential_action) {
            case 1:
                output += ' on delete cascase';
                break;
            case 2:
                output += ' on delete set null';
                break;
            case 3:
                output += ' on delete set default';
                break;
        }

        switch (item.update_referential_action) {
            case 1:
                output += ' on update cascase';
                break;
            case 2:
                output += ' on update set null';
                break;
            case 3:
                output += ' on update set default';
                break;
        }

        output += ` alter table [${item.schema}].[${item.table}] check constraint [${item.name}]`;
        return output;
    },

    /**
     * Get script for table's indexes.
     *
     * @param item Row from `sys.indexes` query.
     * @returns String for use in table script.
     */
    index: function (item) {
        let output = `create`;

        if (item.is_unique) {
            output += ' unique';
        }

        output += ` nonclustered index [${item.name}] on [${item.schema}].[${item.table}]`;
        output += `([${item.column}] ${item.is_descending_key ? 'desc' : 'asc'})`;

        // todo (jbl): includes

        return output;
    }

};